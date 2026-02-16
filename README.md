# Turborepo Microservices E-commerce

This is a microservices-based e-commerce application built with Turborepo, Next.js, and various Node.js frameworks.

## Services Overview

### 1. Client (`apps/client`)
*   **Description**: The storefront application for customers to browse products, add them to cart, and place orders.
*   **Tech Stack**: Next.js 15, React 19, Tailwind CSS, Clerk (Auth), Stripe (Payments), Zustand (State).
*   **Local URL**: [http://localhost:3002](http://localhost:3002)
*   **Key Pages**:
    *   `/`: Homepage, lists featured products.
    *   `/products`: Product listing with filters.
    *   `/products/[id]`: Product details.
    *   `/cart`: Shopping cart.
    *   `/orders`: Order history.

### 2. Admin (`apps/admin`)
*   **Description**: The dashboard for administrators to manage the platform.
*   **Tech Stack**: Next.js 15, React 19, Tailwind CSS, Clerk (Auth), Recharts (Analytics).
*   **Local URL**: [http://localhost:3003](http://localhost:3003)
*   **Key Pages**:
    *   `/`: Dashboard overview.
    *   `/products`: Manage products (CRUD).
    *   `/orders`: View all orders.
    *   `/users`: Manage users.

### 3. Auth Service (`apps/auth-service`)
*   **Description**: Manages user data synchronization between Clerk and the internal system.
*   **Tech Stack**: Express, Clerk SDK, Kafka.
*   **Port**: `8003`
*   **Routes & Data Flow**:
    *   `GET /`: List all users (fetches from Clerk).
    *   `GET /:id`: Get specific user details.
    *   `POST /` (Admin only): Create a new user in Clerk -> Producer sends `user.created` event -> Returns user object.
    *   `DELETE /:id`: Delete a user from Clerk.

### 4. Product Service (`apps/product-service`)
*   **Description**: Manages the product catalog and categories.
*   **Tech Stack**: Express, PostgreSQL, Prisma, Kafka.
*   **Port**: `8000`
*   **Routes & Data Flow**:
    *   `GET /products`: List products (supports filtering/sorting).
    *   `GET /products/:id`: Get product details.
    *   `POST /products` (Admin): Create product -> Save to Postgres.
    *   `PUT /products/:id` (Admin): Update product.
    *   `DELETE /products/:id` (Admin): Delete product.
    *   `GET /categories`: List categories.
    *   `POST /categories` (Admin): Create category.

### 5. Order Service (`apps/order-service`)
*   **Description**: Handles order placement, history, and analytics.
*   **Tech Stack**: Fastify, MongoDB, Mongoose, Kafka.
*   **Port**: `8001`
*   **Routes & Data Flow**:
    *   `GET /user-orders` (User): List authenticated user's orders (queries MongoDB).
    *   `GET /orders` (Admin): List all orders.
    *   `GET /order-chart` (Admin): Aggregates order data for the last 6 months for analytics charts.
    *   **Kafka Consumer**: Listens for `payment.successful` -> Creates Order in MongoDB -> Produces `order.created` event.

### 6. Payment Service (`apps/payment-service`)
*   **Description**: Manages payments via Stripe.
*   **Tech Stack**: Hono, Stripe SDK, Kafka.
*   **Port**: `8002`
*   **Routes & Data Flow**:
    *   `POST /sessions/create-checkout-session`: 
        *   Receives cart items -> Calculates prices (validates from Product Service implicitly via Stripe or params) -> Creates Stripe Checkout Session -> Returns `clientSecret`.
    *   `GET /sessions/:session_id`: Checks status of a payment session.
    *   `POST /webhooks/stripe`: 
        *   Receives Stripe Webhook (signature verification) -> Checks for `checkout.session.completed` -> Produces `payment.successful` kafka event.

### 7. Email Service (`apps/email-service`)
*   **Description**: Sends transactional emails based on system events.
*   **Tech Stack**: Node.js, Nodemailer (Gmail OAuth2), Kafka.
*   **Type**: Worker (No HTTP API).
*   **Process Execution**:
    *   Consumes `user.created` -> Sends "Welcome" email.
    *   Consumes `order.created` -> Sends "Order Confirmation" email.

## Environment Variables

### 1. auth-service
*   `CLERK_SECRET_KEY`: **Required**. For Clerk authentication client.
*   `KAFKA_BROKERS`: **Optional**. Defaults to `localhost:9094`.

### 2. admin (Next.js App)
*   `NEXT_PUBLIC_PRODUCT_SERVICE_URL`: **Required**. URL for the Product Service.
*   `NEXT_PUBLIC_ORDER_SERVICE_URL`: **Required**. URL for the Order Service.
*   `NEXT_PUBLIC_AUTH_SERVICE_URL`: **Required**. URL for the Auth Service.
*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: **Required**. Clerk Publishable Key (Client-side).
*   `CLERK_SECRET_KEY`: **Required**. Clerk Secret Key (Server-side).

### 3. client (Next.js App)
*   `NEXT_PUBLIC_PAYMENT_SERVICE_URL`: **Required**. URL for the Payment Service.
*   `NEXT_PUBLIC_PRODUCT_SERVICE_URL`: **Required**. URL for the Product Service.
*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: **Required**. Clerk Publishable Key.
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: **Required**. Stripe Publishable Key.

### 4. email-service
*   `GOOGLE_CLIENT_ID`: **Required**. For Nodemailer OAuth2 (Gmail).
*   `GOOGLE_CLIENT_SECRET`: **Required**. For Nodemailer OAuth2 (Gmail).
*   `GOOGLE_REFRESH_TOKEN`: **Required**. For Nodemailer OAuth2 (Gmail).
*   `KAFKA_BROKERS`: **Optional**. Defaults to `localhost:9094`.

### 5. order-service
*   `MONGO_URL`: **Required**. MongoDB Connection String.
*   `CLERK_SECRET_KEY`: **Required**. Clerk Secret Key.
*   `CLERK_PUBLISHABLE_KEY`: **Required**. Clerk Publishable Key.
*   `KAFKA_BROKERS`: **Optional**. Defaults to `localhost:9094`.

### 6. payment-service
*   `STRIPE_SECRET_KEY`: **Required**. Stripe Secret Key.
*   `STRIPE_WEBHOOK_SECRET`: **Required**. Stripe Webhook Secret.
*   `CLERK_SECRET_KEY`: **Required**. Clerk Secret Key.
*   `CLERK_PUBLISHABLE_KEY`: **Required**. Clerk Publishable Key.
*   `KAFKA_BROKERS`: **Optional**. Defaults to `localhost:9094`.

### 7. product-service
*   `DATABASE_URL`: **Required**. PostgreSQL Connection String.
*   `CLERK_SECRET_KEY`: **Required**. Clerk Secret Key.
*   `CLERK_PUBLISHABLE_KEY`: **Required**. Clerk Publishable Key.
*   `KAFKA_BROKERS`: **Optional**. Defaults to `localhost:9094`.

---

## How to Run

### Prerequisites
*   **Node.js** (v18+)
*   **PNPM** (Package Manager)
*   **Docker & Docker Compose** (For Kafka, MongoDB, Postgres)
*   **Clerk Account** (For Auth)
*   **Stripe Account** (For Payments)
*   **Google Cloud Console** (For Gmail OAuth2 - Email Service)

### 1. Environment Setup
Review the `env_vars_report.md` (if available) or check `.env.example` in each service to set up your `.env` files.
*   `apps/admin/.env`
*   `apps/client/.env`
*   `apps/auth-service/.env`
*   `apps/product-service/.env`
*   `apps/order-service/.env`
*   `apps/payment-service/.env`
*   `apps/email-service/.env`
*   `packages/product-db/.env` (For database migrations)
*   `packages/order-db/.env`

### 2. Start Infrastructure
Start the supporting services (databases and message broker):
```bash
docker-compose up -d
```
This will start:
*   **Zookeeper & Kafka** (Port 9094)
*   **MongoDB** (Port 27017)
*   **PostgreSQL** (Port 5432)

### 3. Run Migrations
Ensure your SQL database schema is up to date:
```bash
# In packages/product-db
cd packages/product-db
npx prisma migrate dev
```

### 4. Start Microservices
You can start all services using Turbo:
```bash
pnpm dev
# or
turbo dev
```

Or start them individually in separate terminals:
```bash
# Backend Services
pnpm --filter auth-service dev
pnpm --filter product-service dev
pnpm --filter order-service dev
pnpm --filter payment-service dev
pnpm --filter email-service dev

# Frontend Apps
pnpm --filter client dev
pnpm --filter admin dev
```

---

## Useful Links

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [KafkaJS Documentation](https://kafka.js.org/)
