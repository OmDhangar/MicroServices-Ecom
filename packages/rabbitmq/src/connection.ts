import amqplib, { type Connection, type Channel } from "amqplib";

let connection: Connection | null = null;
let channel: Channel | null = null;

export const getRabbitMQChannel = async (): Promise<Channel> => {
    if (channel) return channel;

    const url = process.env.RABBITMQ_URL;
    if (!url) {
        throw new Error("RABBITMQ_URL environment variable is required");
    }

    connection = await amqplib.connect(url);
    channel = await connection.createChannel();

    connection.on("close", () => {
        console.log("RabbitMQ connection closed");
        connection = null;
        channel = null;
    });

    connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
        connection = null;
        channel = null;
    });

    console.log("Connected to RabbitMQ");
    return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
    if (channel) {
        await channel.close();
        channel = null;
    }
    if (connection) {
        await connection.close();
        connection = null;
    }
};
