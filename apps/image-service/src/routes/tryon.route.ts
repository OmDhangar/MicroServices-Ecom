import { Router } from "express";
import { shouldBeUser } from "../middleware/authMiddleware";
import { tryonRateLimiter } from "../middleware/rateLimiter";
import {
    createTryOnJob,
    getTryOnJobStatus,
} from "../controllers/tryon.controller";

const router: Router = Router();

router.post("/request", shouldBeUser, tryonRateLimiter, createTryOnJob);

router.get("/jobs/:jobId", shouldBeUser, getTryOnJobStatus);

export default router;
