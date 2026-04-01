import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
    if (!ai) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is required");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export interface TryOnResult {
    imageBuffer: Buffer;
    contentType: string;
}

/**
 * Generate a virtual try-on image using Gemini's native image generation.
 * Uses gemini-3.1-flash-image-preview (Nano Banana) via the @google/genai SDK.
 * This model natively outputs images without requiring responseModalities config.
 */
export const generateTryOnImage = async (
    userImageBuffer: Buffer,
    productImageBuffer: Buffer
): Promise<TryOnResult> => {
    const client = getAI();

    const prompt = `You are a virtual try-on assistant. Given the user's photo and a product clothing image, generate a realistic image of the user wearing the product.
Maintain the user's body shape, skin tone, and pose.
The clothing should look naturally fitted and properly positioned.
Only output the final try-on image, no text.`;

    const response = await client.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "image/webp",
                            data: userImageBuffer.toString("base64"),
                        },
                    },
                    {
                        inlineData: {
                            mimeType: "image/webp",
                            data: productImageBuffer.toString("base64"),
                        },
                    },
                ],
            },
        ],
    });

    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts || parts.length === 0) {
        throw new Error("Gemini returned no content");
    }

    for (const part of parts) {
        if (part.inlineData?.data) {
            return {
                imageBuffer: Buffer.from(part.inlineData.data, "base64"),
                contentType: part.inlineData.mimeType || "image/png",
            };
        }
    }

    const textResponse = parts.find((p) => p.text)?.text || "empty";
    throw new Error("Gemini did not return an image. Response: " + textResponse);
};

/**
 * Fallback: returns user image as-is.
 * Replace with Imagen or another model in production for better results.
 */
export const generateTryOnImageFallback = async (
    userImageBuffer: Buffer,
    _productImageBuffer: Buffer
): Promise<TryOnResult> => {
    console.warn("Using fallback try-on generation (no-op)");
    return {
        imageBuffer: userImageBuffer,
        contentType: "image/webp",
    };
};
