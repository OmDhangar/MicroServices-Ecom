"use client";

import { useAuth } from "@clerk/nextjs";
import { Camera, Loader2, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

const IMAGE_SERVICE_URL =
    process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || "http://localhost:8004";

type TryOnStatus = "idle" | "uploading" | "processing" | "completed" | "error";

interface TryOnModalProps {
    cartItemId: string;
    productName: string;
}

const TryOnModal = ({ cartItemId, productName }: TryOnModalProps) => {
    const { getToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<TryOnStatus>("idle");
    const [preview, setPreview] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const reset = () => {
        setStatus("idle");
        setPreview(null);
        setResultUrl(null);
        setErrorMsg(null);
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        reset();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        setStatus("idle");
        setResultUrl(null);
        setErrorMsg(null);
    };

    const pollJobStatus = (jobId: string, getTokenFn: () => Promise<string | null>) => {
        pollRef.current = setInterval(async () => {
            try {
                const freshToken = await getTokenFn();
                if (!freshToken) return;

                const res = await fetch(`${IMAGE_SERVICE_URL}/api/tryon/jobs/${jobId}`, {
                    headers: { Authorization: `Bearer ${freshToken}` },
                });
                const data = await res.json();

                if (data.status === "completed" && data.resultUrl) {
                    setResultUrl(data.resultUrl);
                    setStatus("completed");
                    if (pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                } else if (data.status === "failed") {
                    setErrorMsg(data.error || "Try-on processing failed.");
                    setStatus("error");
                    if (pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                }
            } catch {
                setErrorMsg("Failed to fetch job status.");
                setStatus("error");
                if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
            }
        }, 3000);
    };

    const handleTryOn = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setErrorMsg("Please select an image first.");
            return;
        }
        if (!cartItemId) {
            setErrorMsg(
                "Cart item ID not assigned yet. Please wait a moment and try again."
            );
            return;
        }

        setErrorMsg(null);
        setStatus("uploading");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            // Step 1: Upload user image
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch(
                `${IMAGE_SERVICE_URL}/api/users/me/tryon-image`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.message || "Failed to upload image.");
            }

            const { imageKey } = await uploadRes.json();

            // Step 2: Create try-on job
            setStatus("processing");

            const jobRes = await fetch(`${IMAGE_SERVICE_URL}/api/tryon/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cartItemId, userImageKey: imageKey }),
            });

            if (!jobRes.ok) {
                const err = await jobRes.json();
                throw new Error(err.message || "Failed to create try-on job.");
            }

            const { jobId } = await jobRes.json();

            // Step 3: Poll for result with fresh token on each tick
            pollJobStatus(jobId, getToken);
        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong.");
            setStatus("error");
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors px-2.5 py-1.5 rounded-md cursor-pointer"
                title="Try this item on virtually"
            >
                <Camera className="w-3.5 h-3.5" />
                Try On
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleClose();
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-5 p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-800">
                                    Virtual Try-On
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    {productName}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Upload Area */}
                        {status !== "completed" && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group"
                            >
                                {preview ? (
                                    <div className="relative w-40 h-40 rounded-lg overflow-hidden ring-2 ring-purple-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={preview}
                                            alt="Your photo preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors flex items-center justify-center">
                                            <Upload className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-700">
                                                Upload your photo
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                JPG, PNG or WEBP · Max 10 MB
                                            </p>
                                        </div>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}

                        {/* Result Image */}
                        {status === "completed" && resultUrl && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Try-on complete!
                                </div>
                                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden ring-2 ring-green-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={resultUrl}
                                        alt="Try-on result"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <button
                                    onClick={reset}
                                    className="text-xs text-purple-600 hover:underline cursor-pointer"
                                >
                                    Try another photo
                                </button>
                            </div>
                        )}

                        {/* Status / Error */}
                        {status === "uploading" && (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                Uploading your photo…
                            </div>
                        )}
                        {status === "processing" && (
                            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 py-2">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                <span>Generating try-on result…</span>
                                <span className="text-xs text-gray-400">
                                    This may take up to a minute.
                                </span>
                            </div>
                        )}
                        {status === "error" && errorMsg && (
                            <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {status !== "completed" && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 py-2 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTryOn}
                                    disabled={!preview || status === "uploading" || status === "processing"}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-200 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {(status === "uploading" || status === "processing") ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing…
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-4 h-4" />
                                            Try On
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default TryOnModal;
