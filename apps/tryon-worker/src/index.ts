import { connectOrderDB } from "@repo/order-db";
import { consumeFromQueue } from "@repo/rabbitmq";
import { processJob, type TryOnMessage } from "./processor.js";

const QUEUE_NAME = "tryon-jobs";

const start = async () => {
    try {
        // Connect to MongoDB
        await connectOrderDB();
        console.log("Try-on worker starting...");

        // Start consuming from RabbitMQ
        await consumeFromQueue(QUEUE_NAME, async (msg) => {
            const message: TryOnMessage = JSON.parse(msg.content.toString());
            await processJob(message);
        });

        console.log(`Try-on worker listening on queue: ${QUEUE_NAME}`);
    } catch (error) {
        console.error("Worker failed to start:", error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("Worker shutting down...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("Worker shutting down...");
    process.exit(0);
});

start();
