import { Router } from "express";
import multer from "multer";
import { shouldBeUser } from "../middleware/authMiddleware";
import { validateFileUpload } from "../middleware/fileValidation";
import { uploadTryOnImage } from "../controllers/userImage.controller";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router: Router = Router();

router.post(
    "/me/tryon-image",
    shouldBeUser,
    upload.single("file"),
    validateFileUpload,
    uploadTryOnImage
);

export default router;
