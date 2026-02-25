import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectOrderDB } from "@repo/order-db";
import userImageRouter from "./routes/userImage.route";
import tryonRouter from "./routes/tryon.route";

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3002", "http://localhost:3003"],
        credentials: true,
    })
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
    return res.status(200).json({
        status: "ok",
        service: "image-service",
        uptime: process.uptime(),
        timestamp: Date.now(),
    });
});

app.use("/api/users", userImageRouter);
app.use("/api/tryon", tryonRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    return res
        .status(err.status || 500)
        .json({ message: err.message || "Internal Server Error" });
});

const start = async () => {
    try {
        await connectOrderDB();
        app.listen(8004, () => {
            console.log("Image service is running on port 8004");
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
