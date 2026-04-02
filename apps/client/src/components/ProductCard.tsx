"use client";

import useCartStore from "@/stores/cartStore";
import { ProductType } from "@repo/types";
import { ShoppingBag } from "lucide-react"; // Swapped to ShoppingBag for a higher-end fashion feel
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ProductCard = ({ product }: { product: ProductType }) => {
  const [productTypes, setProductTypes] = useState({
    size: product.sizes[0]!,
    color: product.colors[0]!,
  });
  const [isHovered, setIsHovered] = useState(false);

  const { addToCart } = useCartStore();

  const handleProductType = ({ type, value }: { type: "size" | "color"; value: string }) => {
    setProductTypes((prev) => ({ ...prev, [type]: value }));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the product page when clicking the button
    addToCart({
      ...product,
      quantity: 1,
      selectedSize: productTypes.size,
      selectedColor: productTypes.color,
    });
    toast.success("Added to collection", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      className: "bg-black text-white font-medium tracking-wide text-sm rounded-xl", // Premium toast styling
    });
  };

  const isNew = new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  // Premium physics config
  const liquidSpring = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="group flex flex-col gap-4 h-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. PREMIUM IMAGE CONTAINER */}
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-[3/4] w-full rounded-2xl bg-gray-100 overflow-hidden block"
      >
        <motion.div
          className="w-full h-full relative origin-center"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Luxurious slow-ease out
        >
          <Image
            src={(() => {
              const src = (product.images as Record<string, string>)?.[productTypes.color];
              return src?.startsWith("http") || src?.startsWith("data:")
                ? src
                : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            })()}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </motion.div>

        {/* Dynamic Shadow & Vignette for depth on hover */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
        />

        {/* Glassmorphic Badge (Matches Hero Section) */}
        {isNew && (
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-sm z-10">
            New
          </div>
        )}

        {/* 2. FLOATING QUICK-ADD BUTTON */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
              transition={liquidSpring}
              className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-4"
            >
              <button
                onClick={handleAddToCart}
                className="w-full max-w-[200px] bg-white/90 backdrop-blur-md text-black px-4 py-3 rounded-full font-bold text-xs tracking-widest uppercase overflow-hidden shadow-xl hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Quick Add</span>
                <ShoppingBag className="w-3.5 h-3.5 mb-[1px]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* 3. EDITORIAL METADATA */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex justify-between items-start gap-4 pt-1">
          {/* TITLE: Bold Sans Uppercase */}
          <Link href={`/products/${product.id}`} className="flex-1">
            <h2 className="font-black text-lg text-gray-900 line-clamp-1 leading-none uppercase tracking-tighter group-hover:text-black transition-colors">
              {product.name}
            </h2>
          </Link>
          {/* PRICE: Italic Serif */}
          <span className="font-serif italic text-lg text-gray-500 leading-none">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-2 mb-4">
          {product.shortDescription}
        </p>

        {/* 4. MINIMALIST SELECTORS */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <button
                key={color}
                onClick={(e) => {
                  e.preventDefault();
                  handleProductType({ type: "color", value: color });
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  productTypes.color === color ? "ring-1 ring-black ring-offset-2" : "border border-gray-200"
                }`}
                title={color}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                  style={{ backgroundColor: color }}
                />
              </button>
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-gray-400 font-bold ml-1 tracking-wider uppercase">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;