import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem("cart:v1");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem("cart:v1", JSON.stringify(items));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function CartProvider({ children }) {
  /** Provides cart state/actions to the app. */
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const value = useMemo(() => {
    const addItem = (menuItem) => {
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === menuItem.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          return next;
        }
        return [...prev, { ...menuItem, quantity: 1 }];
      });
    };

    const removeItem = (id) => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    };

    const updateQuantity = (id, quantity) => {
      setItems((prev) =>
        prev
          .map((x) => (x.id === id ? { ...x, quantity: Math.max(1, Number(quantity) || 1) } : x))
          .filter((x) => x.quantity > 0)
      );
    };

    const clear = () => setItems([]);

    const subtotal = items.reduce((sum, x) => sum + x.price * x.quantity, 0);

    return { items, addItem, removeItem, updateQuantity, clear, subtotal };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// PUBLIC_INTERFACE
export function useCart() {
  /** Hook to access cart state/actions. */
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
