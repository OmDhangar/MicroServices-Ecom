import mongoose, { InferSchemaType, model } from "mongoose";
const { Schema } = mongoose;

const FileMetaTypes = ["product", "user-tryon", "tryon-result"] as const;

const FileMetaSchema = new Schema(
    {
        key: { type: String, required: true, unique: true, index: true },
        bucket: { type: String, required: true },
        type: { type: String, required: true, enum: FileMetaTypes },
        productId: { type: Number },
        userId: { type: String },
        color: { type: String },
        contentType: { type: String, required: true },
        size: { type: Number, required: true },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

// TTL index: automatically delete documents when expiresAt is reached
FileMetaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type FileMetaSchemaType = InferSchemaType<typeof FileMetaSchema>;

export const FileMeta = model<FileMetaSchemaType>("FileMeta", FileMetaSchema);
