import { Request, Response } from "express";
import { uploadToS3 } from "@repo/s3";
import { FileMeta } from "@repo/order-db";
import sharp from "sharp";
import crypto from "crypto";

export const uploadTryOnImage = async (req: Request, res: Response) => {
    const userId = req.userId!;
    const file = req.file!;

    try {
        // Compress image: resize to max 1024px and convert to webp
        const compressed = await sharp(file.buffer)
            .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        const timestamp = Date.now();
        const id = crypto.randomUUID();
        const key = `users/tryon-inputs/${userId}/${timestamp}-${id}.webp`;
        const bucket = process.env.AWS_S3_BUCKET!;

        await uploadToS3(key, compressed, "image/webp");

        // Create FileMeta with 24h expiry
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await FileMeta.create({
            key,
            bucket,
            type: "user-tryon",
            userId,
            contentType: "image/webp",
            size: compressed.length,
            expiresAt,
        });

        return res.status(200).json({
            message: "Image uploaded successfully",
            imageKey: key,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error("Error uploading try-on image:", error);
        return res.status(500).json({ message: "Failed to upload image" });
    }
};
