import Fastify from "fastify";
import Clerk from "@clerk/fastify";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";
import { cartRoute } from "./routes/cart.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const fastify = Fastify();

fastify.register(Clerk.clerkPlugin);

// Manual CORS implementation since @fastify/cors is missing
fastify.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "http://localhost:3002");
  reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  reply.header("Access-Control-Allow-Credentials", "true");
  if (request.method === "OPTIONS") {
    return reply.status(204).send();
  }
});

fastify.setErrorHandler((error, request, reply) => {
  console.error("Order Service Error:", error);
  reply.status(error.statusCode || 500).send({
    message: error.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({
    message: "Order service is authenticated!",
    userId: request.userId,
  });
});

fastify.register(orderRoute);
fastify.register(cartRoute);

const start = async () => {
  try {
    await Promise.all([
      connectOrderDB(),
      producer.connect(),
      consumer.connect(),
    ]);
    await runKafkaSubscriptions();
    await fastify.listen({ port: 8001 });
    console.log("Order service is running on port 8001");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
