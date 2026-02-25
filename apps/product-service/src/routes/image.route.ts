import { Router } from "express";
import multer from "multer";
import { uploadProductImages } from "../controllers/image.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router: Router = Router();

router.post(
    "/products/:productId/upload",
    shouldBeAdmin,
    upload.array("files[]", 10),
    uploadProductImages
);

export default router;
