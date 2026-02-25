import mongoose, { InferSchemaType, model } from "mongoose";
const { Schema } = mongoose;

const CartItemSchema = new Schema({
    cartItemId: { type: String, required: true },
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    selectedColor: { type: String, required: true },
    selectedSize: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
});

const CartSchema = new Schema(
    {
        userId: { type: String, required: true, unique: true, index: true },
        items: { type: [CartItemSchema], default: [] },
    },
    { timestamps: true }
);

export type CartItemSchemaType = InferSchemaType<typeof CartItemSchema>;
export type CartSchemaType = InferSchemaType<typeof CartSchema>;

export const Cart = model<CartSchemaType>("Cart", CartSchema);
