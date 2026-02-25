import { downloadFromS3, uploadToS3 } from "@repo/s3";
import { TryOnJob, FileMeta } from "@repo/order-db";
import sharp from "sharp";
import crypto from "crypto";
import {
    generateTryOnImage,
    generateTryOnImageFallback,
} from "./gemini.js";

const MAX_RETRIES = 3;

export interface TryOnMessage {
    jobId: string;
    userId: string;
    productId: number;
    cartItemId: string;
    userImageKey: string;
    productImageKey: string;
}

export const processJob = async (message: TryOnMessage): Promise<void> => {
    const { jobId, userId, productId, userImageKey, productImageKey } = message;

    console.log(`Processing try-on job: ${jobId}`);

    // Update status to processing
    await TryOnJob.updateOne({ jobId }, { status: "processing" });

    try {
        // 1. Download images from S3
        console.log(`Downloading user image: ${userImageKey}`);
        const userImageRaw = await downloadFromS3(userImageKey);

        console.log(`Downloading product image: ${productImageKey}`);
        const productImageRaw = await downloadFromS3(productImageKey);

        // 2. Preprocess images with sharp
        const userImage = await sharp(userImageRaw)
            .resize(512, 512, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

        const productImage = await sharp(productImageRaw)
            .resize(512, 512, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

        // Validate preprocessed images
        const userMeta = await sharp(userImage).metadata();
        const productMeta = await sharp(productImage).metadata();

        if (!userMeta.width || !userMeta.height) {
            throw new Error("Invalid user image after preprocessing");
        }
        if (!productMeta.width || !productMeta.height) {
            throw new Error("Invalid product image after preprocessing");
        }

        // 3. Call Gemini API (with fallback)
        let result;
        try {
            result = await generateTryOnImage(userImage, productImage);
        } catch (primaryError) {
            console.warn(
                `Primary model failed for job ${jobId}:`,
                primaryError
            );
            console.log("Attempting fallback...");
            result = await generateTryOnImageFallback(userImage, productImage);
        }

        // 4. Quality check — validate result is a valid image
        const resultMeta = await sharp(result.imageBuffer).metadata();
        if (
            !resultMeta.width ||
            !resultMeta.height ||
            resultMeta.width < 64 ||
            resultMeta.height < 64
        ) {
            throw new Error("Generated image failed quality check");
        }

        // Convert result to webp for consistency
        const finalImage = await sharp(result.imageBuffer)
            .webp({ quality: 85 })
            .toBuffer();

        // 5. Upload result to S3
        const timestamp = Date.now();
        const id = crypto.randomUUID();
        const resultKey = `tryon-results/${userId}/${productId}/${timestamp}-${id}.webp`;
        const bucket = process.env.AWS_S3_BUCKET!;

        await uploadToS3(resultKey, finalImage, "image/webp");

        // 6. Create FileMeta for result (24h expiry)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await FileMeta.create({
            key: resultKey,
            bucket,
            type: "tryon-result",
            userId,
            productId,
            contentType: "image/webp",
            size: finalImage.length,
            expiresAt,
        });

        // 7. Update job as completed
        await TryOnJob.updateOne(
            { jobId },
            {
                status: "completed",
                resultImageKey: resultKey,
            }
        );

        console.log(`Job ${jobId} completed successfully`);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`Job ${jobId} failed:`, errorMessage);

        // Check retry count
        const job = await TryOnJob.findOne({ jobId });
        const currentRetries = job?.retryCount || 0;

        if (currentRetries < MAX_RETRIES) {
            await TryOnJob.updateOne(
                { jobId },
                {
                    status: "pending",
                    retryCount: currentRetries + 1,
                    error: errorMessage,
                }
            );
            // The message will be requeued by the consumer's nack
            throw error;
        } else {
            // Max retries exceeded — mark as failed
            await TryOnJob.updateOne(
                { jobId },
                {
                    status: "failed",
                    error: `Failed after ${MAX_RETRIES} retries: ${errorMessage}`,
                }
            );
            console.error(`Job ${jobId} permanently failed after ${MAX_RETRIES} retries`);
        }
    }
};
