import { Request, Response } from "express";
import { Cart, TryOnJob, FileMeta } from "@repo/order-db";
import { getSignedDownloadUrl } from "@repo/s3";
import { publishToQueue } from "@repo/rabbitmq";
import crypto from "crypto";

interface TryOnRequestBody {
    cartItemId: string;
    userImageKey: string;
}

export const createTryOnJob = async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { cartItemId, userImageKey } = req.body as TryOnRequestBody;

    if (!cartItemId || !userImageKey) {
        return res
            .status(400)
            .json({ message: "cartItemId and userImageKey are required" });
    }

    try {
        // 1. Fetch user's cart from MongoDB
        const cart = await Cart.findOne({ userId });
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(403).json({ message: "Your cart is empty" });
        }

        // 2. Verify cartItemId belongs to this user's cart
        const cartItem = cart.items.find(
            (item) => item.cartItemId === cartItemId
        );
        if (!cartItem) {
            return res.status(403).json({
                message: "This item is not in your cart. Try-on is only available for cart items.",
            });
        }

        // 3. Verify userImageKey belongs to this user
        const expectedPrefix = `users/tryon-inputs/${userId}/`;
        if (!userImageKey.startsWith(expectedPrefix)) {
            return res.status(403).json({
                message: "You do not own this image",
            });
        }

        // 4. Verify FileMeta exists for the user image
        const fileMeta = await FileMeta.findOne({
            key: userImageKey,
            userId,
            type: "user-tryon",
        });
        if (!fileMeta) {
            return res.status(404).json({
                message: "User image not found or expired",
            });
        }

        // 5. Build the product image key from the product's data
        // We need to find the product image for the selected color
        const productId = cartItem.productId;
        const selectedColor = cartItem.selectedColor
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-");

        // Find the most recent product image for this product + color
        const productFileMeta = await FileMeta.findOne({
            type: "product",
            productId,
            color: selectedColor,
        }).sort({ createdAt: -1 });

        if (!productFileMeta) {
            return res.status(404).json({
                message: "No product image found for this item's color",
            });
        }

        // 6. Create TryOnJob
        const jobId = crypto.randomUUID();
        await TryOnJob.create({
            jobId,
            userId,
            productId,
            cartItemId,
            userImageKey,
            productImageKey: productFileMeta.key,
            status: "pending",
        });

        // 7. Publish to RabbitMQ
        await publishToQueue("tryon-jobs", {
            jobId,
            userId,
            productId,
            cartItemId,
            userImageKey,
            productImageKey: productFileMeta.key,
        });

        return res.status(200).json({
            message: "Try-on job created",
            jobId,
            status: "pending",
        });
    } catch (error) {
        console.error("Error creating try-on job:", error);
        return res.status(500).json({ message: "Failed to create try-on job" });
    }
};

export const getTryOnJobStatus = async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { jobId } = req.params;

    try {
        const job = await TryOnJob.findOne({ jobId });

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Verify job belongs to this user
        if (job.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const response: Record<string, unknown> = {
            jobId: job.jobId,
            status: job.status,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };

        if (job.status === "completed" && job.resultImageKey) {
            // Generate signed URL for result (5 min expiry)
            response.resultUrl = await getSignedDownloadUrl(
                job.resultImageKey,
                300
            );
        }

        if (job.status === "failed") {
            response.error = job.error;
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error getting try-on job status:", error);
        return res.status(500).json({ message: "Failed to get job status" });
    }
};
