/* eslint react/prop-types: "off" */
import { useCallback, useEffect, useMemo, useState } from "react";
import CartContext from "./CartContext";

const STORAGE_KEY = "meat-market-cart";

function readStoredCart() {
  try {
    const storedCart = localStorage.getItem(STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);
    if (
      !Array.isArray(parsedCart) ||
      parsedCart.some(
        (item) =>
          typeof item.key !== "string" ||
          typeof item.title !== "string" ||
          !Number.isFinite(item.price) ||
          item.price < 0 ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0
      )
    ) {
      throw new Error("Saved cart has an invalid format");
    }
    return parsedCart;
  } catch (error) {
    console.error("Could not read the saved cart:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Could not save the cart:", error);
    }
  }, [items]);

  const addItem = useCallback((item) => {
    setItems((currentItems) => {
      const existing = currentItems.find((current) => current.key === item.key);
      if (existing) {
        return currentItems.map((current) =>
          current.key === item.key
            ? { ...current, quantity: current.quantity + item.quantity }
            : current
        );
      }
      return [...currentItems, item];
    });
  }, []);

  const setQuantity = useCallback((key, quantity) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setItems((currentItems) => currentItems.filter((item) => item.key !== key));
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((currentItems) => currentItems.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, setQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
