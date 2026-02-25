import { S3Client } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

export const getS3Client = (): S3Client => {
    if (!s3Client) {
        const region = process.env.AWS_REGION;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        if (!region || !accessKeyId || !secretAccessKey) {
            throw new Error(
                "Missing AWS credentials: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY are required"
            );
        }

        s3Client = new S3Client({
            region,
            credentials: { accessKeyId, secretAccessKey },
        });
    }

    return s3Client;
};

export const getBucket = (): string => {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
        throw new Error("AWS_S3_BUCKET environment variable is required");
    }
    return bucket;
};
