import { Request, Response } from "express";
import { prisma, Prisma } from "@repo/product-db";
import { uploadToS3, getPublicUrl } from "@repo/s3";
import { connectOrderDB, FileMeta } from "@repo/order-db";
import crypto from "crypto";
import path from "path";

// Ensure MongoDB is connected for FileMeta
let mongoConnected = false;
const ensureMongo = async () => {
    if (!mongoConnected) {
        await connectOrderDB();
        mongoConnected = true;
    }
};

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const normalizeColor = (color: string): string => {
    return color.toLowerCase().trim().replace(/\s+/g, "-");
};

export const uploadProductImages = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { color } = req.body;

    if (!color) {
        return res.status(400).json({ message: "Color is required" });
    }

    if (!productId || isNaN(Number(productId))) {
        return res.status(400).json({ message: "Valid productId is required" });
    }

    // Fetch product to validate color
    const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
    });

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    const normalizedColor = normalizeColor(color);
    const productColors = product.colors.map(normalizeColor);

    if (!productColors.includes(normalizedColor)) {
        return res.status(400).json({
            message: `Color "${color}" does not belong to this product`,
            validColors: product.colors,
        });
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.status(400).json({ message: "At least one file is required" });
    }

    // Validate files
    for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return res.status(400).json({
                message: `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
            });
        }
        if (file.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                message: `File ${file.originalname} exceeds max size of 10MB`,
            });
        }
    }

    await ensureMongo();

    const bucket = process.env.AWS_S3_BUCKET!;
    const uploadedUrls: string[] = [];

    for (const file of files) {
        const timestamp = Date.now();
        const id = crypto.randomUUID();
        const ext = path.extname(file.originalname).slice(1) || "jpg";
        const key = `products/${productId}/${normalizedColor}/${timestamp}-${id}.${ext}`;

        await uploadToS3(key, file.buffer, file.mimetype);

        // Create FileMeta record
        await FileMeta.create({
            key,
            bucket,
            type: "product",
            productId: Number(productId),
            color: normalizedColor,
            contentType: file.mimetype,
            size: file.size,
        });

        uploadedUrls.push(getPublicUrl(key));
    }

    // Update product images JSON — add/replace the color's image URL(s)
    const currentImages =
        typeof product.images === "object" && product.images !== null
            ? (product.images as Record<string, unknown>)
            : {};

    const updatedImages = {
        ...currentImages,
        [normalizedColor]:
            uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls,
    };

    const updatedProduct = await prisma.product.update({
        where: { id: Number(productId) },
        data: { images: updatedImages as Prisma.InputJsonValue },
    });

    return res.status(200).json({
        message: "Images uploaded successfully",
        product: updatedProduct,
        uploadedUrls,
    });
};
