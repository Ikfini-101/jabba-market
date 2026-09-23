"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "./site-config";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  isNegotiable: boolean;
};

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(siteConfig.storageKeys.cart);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(siteConfig.storageKeys.cart, JSON.stringify(cart));
    // Dispatch custom event for Header to update badge
    window.dispatchEvent(new Event("cartUpdated"));
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);

    const onUpdate = () => setCart(getCart());
    window.addEventListener("cartUpdated", onUpdate);
    return () => window.removeEventListener("cartUpdated", onUpdate);
  }, []);

  const addToCart = (item: CartItem) => {
    if (item.isNegotiable) return; // Négociable n'entre jamais dans le panier

    const current = getCart();
    const existing = current.find(i => i.productId === item.productId);
    
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      current.push(item);
    }
    
    saveCart(current);
  };

  const removeFromCart = (productId: string) => {
    const current = getCart().filter(i => i.productId !== productId);
    saveCart(current);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    const current = getCart();
    const existing = current.find(i => i.productId === productId);
    if (existing) {
      existing.quantity = quantity;
      saveCart(current);
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    cart,
    mounted,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
  };
}
