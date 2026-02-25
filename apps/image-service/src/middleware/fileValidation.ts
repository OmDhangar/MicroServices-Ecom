import { Request, Response, NextFunction } from "express";

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const validateFileUpload = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "File is required" });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
            message: `Invalid file type: ${file.mimetype}. Only image files are accepted.`,
        });
    }

    if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
            message: `File exceeds maximum size of 10MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        });
    }

    return next();
};
