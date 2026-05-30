"use client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Product, CartItem } from "../types";
import { MAX_CART_ITEMS } from "../constants";
import { clampCartToCatalog } from "../utils/cart";
import { estimateApproxWaitSeconds } from "../utils/dispenseSchedule";

interface UseCartOptions {
  machineCode: string;
  onCartLimitReached: () => void;
  onStockLimitReached: (message: string) => void;
}

export function useCart({ machineCode, onCartLimitReached, onStockLimitReached }: UseCartOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Stable refs for callbacks to avoid re-creating memoized handlers
  const callbacksRef = useRef({ onCartLimitReached, onStockLimitReached });
  callbacksRef.current = { onCartLimitReached, onStockLimitReached };

  const fetchProducts = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setIsLoadingProducts(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(
          `${apiUrl}/api/products?machine_code=${encodeURIComponent(machineCode)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          desc: p.description,
          price: p.price,
          heatingTime: p.heating_time,
          image: p.image_url,
          category: p.category,
          stock: Number(p.stock) || 0,
        }));

        setProducts(mappedProducts);
        setCart((prev) => clampCartToCatalog(prev, mappedProducts));
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        if (!silent) setIsLoadingProducts(false);
      }
    },
    [machineCode],
  );

  useEffect(() => {
    void fetchProducts({ silent: false });
  }, [fetchProducts]);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    setCart((prevCart) => {
      const totalItems = prevCart.reduce((sum, item) => sum + item.qty, 0);
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.qty >= product.stock) {
          queueMicrotask(() => {
            callbacksRef.current.onStockLimitReached(`สินค้านี้เหลือสูงสุด ${product.stock} ชิ้น`);
          });
          return prevCart;
        }
        if (totalItems >= MAX_CART_ITEMS) {
          queueMicrotask(() => callbacksRef.current.onCartLimitReached());
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      if (totalItems >= MAX_CART_ITEMS) {
        queueMicrotask(() => callbacksRef.current.onCartLimitReached());
        return prevCart;
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  }, []);

  const handleIncrease = useCallback((productId: number) => {
    setCart((prevCart) => {
      const sku = products.find((p) => p.id === productId);
      const cap = sku?.stock ?? 0;
      const line = prevCart.find((item) => item.id === productId);
      if (!line) return prevCart;
      if (line.qty >= cap) {
        queueMicrotask(() => {
          callbacksRef.current.onStockLimitReached(`สินค้านี้เหลือสูงสุด ${cap} ชิ้น`);
        });
        return prevCart;
      }
      const totalItems = prevCart.reduce((sum, item) => sum + item.qty, 0);
      if (totalItems >= MAX_CART_ITEMS) {
        queueMicrotask(() => callbacksRef.current.onCartLimitReached());
        return prevCart;
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item,
      );
    });
  }, [products]);

  const handleDecrease = useCallback((productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, qty: Math.max(1, item.qty - 1) }
          : item,
      ),
    );
  }, []);

  const handleRemove = useCallback((productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const stockById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.stock])) as Record<number, number>,
    [products],
  );

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const totalHeatingTime = estimateApproxWaitSeconds(
    cart.flatMap((item) => Array.from({ length: item.qty }, () => item)),
  );

  return {
    products,
    cart,
    setCart,
    isLoadingProducts,
    fetchProducts,
    handleAddToCart,
    handleIncrease,
    handleDecrease,
    handleRemove,
    stockById,
    totalPrice,
    totalHeatingTime,
  };
}
