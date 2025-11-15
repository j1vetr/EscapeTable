import { useState, useEffect } from "react";
import type { Product } from "@shared/schema";
import { enhancedToast } from "@/lib/enhanced-toast";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = "escapetable_cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        enhancedToast({
          title: "Miktar güncellendi",
          description: `${quantity} adet daha eklendi`,
          type: "success",
          productImage: product.imageUrl || undefined,
          productName: product.name,
        });
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      enhancedToast({
        title: "Sepete eklendi",
        description: `${quantity} adet`,
        type: "success",
        productImage: product.imageUrl || undefined,
        productName: product.name,
      });
      return [...current, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((current) => {
      const item = current.find((i) => i.product.id === productId);
      if (!item) return current;
      
      const newItems = current.filter((i) => i.product.id !== productId);
      
      enhancedToast({
        title: "Sepetten kaldırıldı",
        type: "info",
        productImage: item.product.imageUrl || undefined,
        productName: item.product.name,
        action: {
          label: "Geri Al",
          onClick: () => {
            setItems((prev) => [...prev, item]);
          },
        },
        duration: 5000,
      });
      
      return newItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalInCents = items.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalInCents,
    totalItems,
  };
}
