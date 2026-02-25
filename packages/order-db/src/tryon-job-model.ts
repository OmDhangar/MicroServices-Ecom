import mongoose, { InferSchemaType, model } from "mongoose";
const { Schema } = mongoose;

const TryOnJobStatuses = [
    "pending",
    "processing",
    "completed",
    "failed",
] as const;

const TryOnJobSchema = new Schema(
    {
        jobId: { type: String, required: true, unique: true, index: true },
        userId: { type: String, required: true, index: true },
        productId: { type: Number, required: true },
        cartItemId: { type: String, required: true },
        userImageKey: { type: String, required: true },
        productImageKey: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: TryOnJobStatuses,
            default: "pending",
        },
        resultImageKey: { type: String },
        retryCount: { type: Number, default: 0 },
        error: { type: String },
    },
    { timestamps: true }
);

export type TryOnJobSchemaType = InferSchemaType<typeof TryOnJobSchema>;

export const TryOnJob = model<TryOnJobSchemaType>("TryOnJob", TryOnJobSchema);
