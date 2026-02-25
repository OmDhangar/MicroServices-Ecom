import { FastifyInstance } from "fastify";
import { shouldBeUser } from "../middleware/authMiddleware";
import { Cart } from "@repo/order-db";
import crypto from "crypto";

interface CartItem {
    cartItemId?: string;
    productId: number;
    name: string;
    selectedColor: string;
    selectedSize: string;
    quantity: number;
    price: number;
}

interface SyncCartBody {
    items: CartItem[];
}

export const cartRoute = async (fastify: FastifyInstance) => {
    // Sync cart from frontend
    fastify.post<{ Body: SyncCartBody }>(
        "/cart/sync",
        { preHandler: shouldBeUser },
        async (request, reply) => {
            const userId = request.userId!;
            const { items } = request.body;

            if (!items || !Array.isArray(items)) {
                return reply.status(400).send({ message: "Items array is required" });
            }

            // Assign cartItemId to items that don't have one
            const processedItems = items.map((item) => ({
                cartItemId: item.cartItemId || crypto.randomUUID(),
                productId: item.productId,
                name: item.name,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
                quantity: item.quantity,
                price: item.price,
            }));

            const cart = await Cart.findOneAndUpdate(
                { userId },
                { userId, items: processedItems },
                { upsert: true, new: true }
            );

            return reply.send(cart);
        }
    );

    // Get user's cart
    fastify.get(
        "/cart",
        { preHandler: shouldBeUser },
        async (request, reply) => {
            const userId = request.userId!;
            const cart = await Cart.findOne({ userId });
            return reply.send(cart || { userId, items: [] });
        }
    );
};
