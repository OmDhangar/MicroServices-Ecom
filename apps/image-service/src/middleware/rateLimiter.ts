import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Rate limiter: max 5 try-on requests per user per hour
export const tryonRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    keyGenerator: (req: Request) => {
        return req.userId || req.ip || "anonymous";
    },
    message: {
        message: "Too many try-on requests. Maximum 5 per hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
