import { getRabbitMQChannel } from "./connection.js";
import type { ConsumeMessage } from "amqplib";

export type MessageHandler = (msg: ConsumeMessage) => Promise<void>;

export const consumeFromQueue = async (
    queue: string,
    handler: MessageHandler
): Promise<void> => {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue(queue, { durable: true });
    await channel.prefetch(1);

    console.log(`Waiting for messages on queue: ${queue}`);

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
            await handler(msg);
            channel.ack(msg);
        } catch (error) {
            console.error(`Error processing message from ${queue}:`, error);
            // Requeue the message on failure
            channel.nack(msg, false, true);
        }
    });
};
