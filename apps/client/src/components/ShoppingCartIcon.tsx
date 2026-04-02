"use client";

import useCartStore from "@/stores/cartStore";
import { ShoppingCart } from "lucide-react";

const ShoppingCartIcon = () => {
  const { cart, hasHydrated } = useCartStore();

  return (
    <div className="relative">
      <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-black transition-colors" />
      {hasHydrated && cart.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-amber-400 text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
          {cart.reduce((acc, item) => acc + item.quantity, 0)}
        </span>
      )}
    </div>
  );
};

export default ShoppingCartIcon;
