import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, getBucket } from "./client.js";

export const uploadToS3 = async (
    key: string,
    body: Buffer,
    contentType: string
): Promise<string> => {
    const client = getS3Client();
    const bucket = getBucket();

    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        })
    );

    return key;
};

export const downloadFromS3 = async (key: string): Promise<Buffer> => {
    const client = getS3Client();
    const bucket = getBucket();

    const response = await client.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );

    const stream = response.Body;
    if (!stream) {
        throw new Error(`Empty response body for key: ${key}`);
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

export const getSignedDownloadUrl = async (
    key: string,
    expiresIn: number = 300
): Promise<string> => {
    const client = getS3Client();
    const bucket = getBucket();

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    return getSignedUrl(client, command, { expiresIn });
};

export const deleteFromS3 = async (key: string): Promise<void> => {
    const client = getS3Client();
    const bucket = getBucket();

    await client.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );
};

export const getPublicUrl = (key: string): string => {
    const domain = process.env.CLOUDFRONT_DOMAIN;
    if (domain) {
        return `https://${domain}/${key}`;
    }

    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;

    if (!bucket || !region) {
        throw new Error(
            "Either CLOUDFRONT_DOMAIN or (AWS_S3_BUCKET and AWS_REGION) must be provided"
        );
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};
