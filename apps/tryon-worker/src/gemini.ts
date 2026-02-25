import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = (): GoogleGenerativeAI => {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable is required");
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
};

export interface TryOnResult {
    imageBuffer: Buffer;
    contentType: string;
}

/**
 * Generate a virtual try-on image using Gemini's vision capabilities.
 * Sends both the user photo and product image, asking the model to
 * generate a composite "try-on" image.
 */
export const generateTryOnImage = async (
    userImageBuffer: Buffer,
    productImageBuffer: Buffer
): Promise<TryOnResult> => {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const userImagePart = {
        inlineData: {
            data: userImageBuffer.toString("base64"),
            mimeType: "image/webp",
        },
    };

    const productImagePart = {
        inlineData: {
            data: productImageBuffer.toString("base64"),
            mimeType: "image/webp",
        },
    };

    const prompt = `You are a virtual try-on assistant. Given the user's photo and a product clothing image, generate a realistic image of the user wearing the product. 
Maintain the user's body shape, skin tone, and pose. 
The clothing should look naturally fitted and properly positioned.
Only output the final try-on image.`;

    const result = await model.generateContent([
        prompt,
        userImagePart,
        productImagePart,
    ]);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts || parts.length === 0) {
        throw new Error("Gemini returned no content");
    }

    // Check if the response contains an inline image
    for (const part of parts) {
        if (part.inlineData) {
            return {
                imageBuffer: Buffer.from(part.inlineData.data, "base64"),
                contentType: part.inlineData.mimeType || "image/webp",
            };
        }
    }

    // If Gemini doesn't return an image directly, we fall back to a text response
    // This is a known limitation — real production would use a dedicated image generation model
    throw new Error(
        "Gemini did not return an image. Response: " +
        (parts[0]?.text || "empty")
    );
};

/**
 * Fallback try-on generation (placeholder).
 * In production, you'd plug in another model (Banana, Replicate, etc.)
 */
export const generateTryOnImageFallback = async (
    userImageBuffer: Buffer,
    productImageBuffer: Buffer
): Promise<TryOnResult> => {
    // Fallback: simply return the user image as-is with a watermark note
    // In production, replace with an actual fallback AI model call
    console.warn("Using fallback try-on generation (no-op)");
    return {
        imageBuffer: userImageBuffer,
        contentType: "image/webp",
    };
};
