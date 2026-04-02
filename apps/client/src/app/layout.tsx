import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trendlama - Premium Fashion",
  description: "Experience premium quality clothes with Trendlama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-black selection:text-white`}
        >
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-24 md:pt-28">
            <Navbar />
            <Breadcrumbs />
            <main className="min-h-[calc(100vh-300px)]">
              {children}
            </main>
          </div>
          <Footer />
          <ToastContainer position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
