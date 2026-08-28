"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { App } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  cart: App[];
  cartIds: Set<string>;
  addToCart: (app: App) => void;
  removeFromCart: (appId: string) => void;
  clearCart: () => void;
  isInCart: (appId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "appstore-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<App[]>([]);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.warn("Failed to parse cart from localStorage:", err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist cart to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.warn("Failed to save cart to localStorage:", err);
    }
  }, [cart]);

  // Optimized Set for O(1) lookups
  const cartIds = useMemo(() => new Set(cart.map((item) => item.id)), [cart]);

  const addToCart = useCallback((app: App) => {
    setCart((prev) => {
      if (prev.find((item) => item.id === app.id)) return prev;
      toast.success(`"${app.name}" added to cart`, {
        description: app.publisher,
      });
      return [...prev, app];
    });
  }, []);

  const removeFromCart = useCallback((appId: string) => {
    setCart((prev) => {
      const app = prev.find((item) => item.id === appId);
      if (app) {
        toast.info(`"${app.name}" removed from cart`);
      }
      return prev.filter((item) => item.id !== appId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    toast.info("Queue cleared");
  }, []);

  const isInCart = useCallback(
    (appId: string) => cartIds.has(appId),
    [cartIds]
  );

  const value = useMemo(
    () => ({ cart, cartIds, addToCart, removeFromCart, clearCart, isInCart }),
    [cart, cartIds, addToCart, removeFromCart, clearCart, isInCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error("useCart must be used within a CartProvider");
  return context;
}
