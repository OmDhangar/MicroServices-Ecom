import { CartStoreActionsType, CartStoreStateType } from "@repo/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const ORDER_SERVICE_URL =
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || "http://localhost:8001";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

const debouncedSync = (syncFn: () => Promise<void>) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncFn().catch(console.error);
  }, 500);
};

const useCartStore = create<CartStoreStateType & CartStoreActionsType>()(
  persist(
    (set, get) => ({
      cart: [],
      hasHydrated: false,
      addToCart: (product) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (p) =>
              p.id === product.id &&
              p.selectedSize === product.selectedSize &&
              p.selectedColor === product.selectedColor
          );

          if (existingIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingIndex]!.quantity += product.quantity || 1;
            return { cart: updatedCart };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...product,
                quantity: product.quantity || 1,
                selectedSize: product.selectedSize,
                selectedColor: product.selectedColor,
              },
            ],
          };
        });
        debouncedSync(() => get().syncCart());
      },
      removeFromCart: (product) => {
        set((state) => ({
          cart: state.cart.filter(
            (p) =>
              !(
                p.id === product.id &&
                p.selectedSize === product.selectedSize &&
                p.selectedColor === product.selectedColor
              )
          ),
        }));
        debouncedSync(() => get().syncCart());
      },
      clearCart: () => {
        set({ cart: [] });
        debouncedSync(() => get().syncCart());
      },
      syncCart: async () => {
        const { cart } = get();
        try {
          const res = await fetch(`${ORDER_SERVICE_URL}/cart/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              items: cart.map((item) => ({
                cartItemId: item.cartItemId,
                productId: item.id,
                name: item.name,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize,
                quantity: item.quantity,
                price: item.price,
              })),
            }),
          });

          if (res.ok) {
            const serverCart = await res.json();
            // Update local cart with server-assigned cartItemIds
            if (serverCart.items && Array.isArray(serverCart.items)) {
              set((state) => ({
                cart: state.cart.map((localItem) => {
                  const serverItem = serverCart.items.find(
                    (si: any) =>
                      si.productId === localItem.id &&
                      si.selectedColor === localItem.selectedColor &&
                      si.selectedSize === localItem.selectedSize
                  );
                  if (serverItem) {
                    return { ...localItem, cartItemId: serverItem.cartItemId };
                  }
                  return localItem;
                }),
              }));
            }
          }
        } catch (error) {
          // Silently fail — cart sync is best-effort
          console.error("Cart sync failed:", error);
        }
      },
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

export default useCartStore;
