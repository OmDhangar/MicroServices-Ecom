import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import webhookRoute from "./routes/webhooks.route.js";

const app = new Hono();

// CORS must be first so preflight OPTIONS requests are handled before auth
app.use("*", cors({ origin: ["http://localhost:3002"] }));

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use("/sessions/*", clerkMiddleware());
app.use("/webhooks/*", clerkMiddleware());
app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);

// Always return JSON errors — prevents "Internal Server Error" plain text
app.onError((err, c) => {
  console.error("[payment-service] Unhandled error:", err.message, err.stack);
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

// app.post("/create-stripe-product", async (c) => {
//   const res = await stripe.products.create({
//     id: "123",
//     name: "Test Product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });

//   return c.json(res);
// });

// app.get("/stripe-product-price", async (c) => {
//   const res = await stripe.prices.list({
//     product: "123",
//   });

//   return c.json(res);
// });

const start = async () => {
  // Start HTTP server immediately — don't gate it behind Kafka
  serve(
    {
      fetch: app.fetch,
      port: 8002,
    },
    (info) => {
      console.log(`Payment service is running on port 8002`);
    }
  );

  // Connect Kafka in background — best-effort (not required for checkout sessions)
  try {
    await Promise.all([producer.connect(), consumer.connect()]);
    await runKafkaSubscriptions();
    console.log("Kafka connected and subscriptions running");
  } catch (error) {
    console.warn(
      "Kafka unavailable — running without Kafka (checkout sessions unaffected):",
      (error as Error).message
    );
  }
};
start();
