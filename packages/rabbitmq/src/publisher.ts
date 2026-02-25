import { getRabbitMQChannel } from "./connection.js";

export const publishToQueue = async (
    queue: string,
    message: object
): Promise<void> => {
    const channel = await getRabbitMQChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
