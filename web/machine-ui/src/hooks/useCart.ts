"use client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Product, CartItem } from "../types";
import { MAX_CART_ITEMS, getPublicApiUrl, useMockProducts } from "../constants";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import { clampCartToCatalog } from "../utils/cart";
import { estimateApproxWaitSeconds } from "../utils/dispenseSchedule";

interface UseCartOptions {
  machineCode: string;
  onCartLimitReached: () => void;
  onStockLimitReached: (message: string) => void;
}

const PRODUCT_CATEGORIES = ["meat", "vegetarian", "sweet"] as const;

function parseProductCategory(raw?: string): Product["category"] {
  if (raw && (PRODUCT_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as (typeof PRODUCT_CATEGORIES)[number];
  }
  return undefined;
}

// useCart Hook
// - จัดการสถานะและระบบตะกร้าสินค้าทั้งหมด
// - เช่น การโหลดสินค้าจาก API, การเพิ่ม/ลด/ลบสินค้าในตะกร้า, เช็คสต็อก, และคำนวณราคารวม/เวลาอุ่นรวม
export function useCart({ machineCode, onCartLimitReached, onStockLimitReached }: UseCartOptions) {
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const callbacksRef = useRef({ onCartLimitReached, onStockLimitReached });
  callbacksRef.current = { onCartLimitReached, onStockLimitReached };

  // ดึงรายการสินค้าสำหรับตู้นี้จาก API backend
  const fetchProducts = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setIsLoadingProducts(true);
      try {
        if (useMockProducts()) {
          setProducts(MOCK_PRODUCTS);
          setCart((prev) => clampCartToCatalog(prev, MOCK_PRODUCTS));
          console.info("[useCart] Using mock products (NEXT_PUBLIC_USE_MOCK_PRODUCTS)");
          return;
        }

        const apiUrl = getPublicApiUrl();
        const response = await fetch(
          `${apiUrl}/api/products?machine_code=${encodeURIComponent(machineCode)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const mappedProducts: Product[] = (Array.isArray(data) ? data : []).map(
          (p: {
            product_id: number;
            name: string;
            description?: string;
            price: number;
            heating_time?: number;
            image_url?: string;
            category?: string;
            stock?: number;
          }) => ({
            id: p.product_id,
            name: p.name,
            desc: p.description ?? "",
            price: p.price,
            heatingTime: p.heating_time ?? 15,
            image: p.image_url || "/Logo_modpao.png",
            category: parseProductCategory(p.category),
            stock: Number(p.stock) || 0,
          }),
        );

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

  // ดึงข้อมูลสินค้าครั้งแรก
  useEffect(() => {
    void fetchProducts({ silent: false });
  }, [fetchProducts]);

  // ฟังก์ชันเพิ่มสินค้าเข้าไปในตะกร้า
  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const totalItems = prevCart.reduce((sum, item) => sum + item.qty, 0);
      const existingItem = prevCart.find((item) => item.id === product.id);

      // กรณีมีสินค้านี้ในตะกร้าอยู่แล้ว
      if (existingItem) {
        if (existingItem.qty >= product.stock) {
          queueMicrotask(() => {
            callbacksRef.current.onStockLimitReached(`สินค้านี้เหลือสูงสุด ${product.stock} ชิ้น`);
          });
          return prevCart;
        }
        // เช็คว่าจำนวนชิ้นทั้งหมดในตะกร้าเกินขีดจำกัดหรือไม่
        if (totalItems >= MAX_CART_ITEMS) {
          queueMicrotask(() => callbacksRef.current.onCartLimitReached());
          return prevCart;
        }
        // เพิ่มจำนวนสินค้าชิ้นนั้นขึ้น 1 ชิ้น
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      // กรณียังไม่มีสินค้านี้ในตะกร้าเลย
      if (totalItems >= MAX_CART_ITEMS) {
        queueMicrotask(() => callbacksRef.current.onCartLimitReached());
        return prevCart;
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  }, []);

  // ฟังก์ชันเพิ่มจำนวนสินค้าชิ้นเดิมขึ้นทีละ 1 ชิ้นจากปุ่มในตะกร้า
  const handleIncrease = useCallback((productId: number) => {
    setCart((prevCart) => {
      const sku = products.find((p) => p.id === productId);
      const cap = sku?.stock ?? 0;
      const line = prevCart.find((item) => item.id === productId);
      if (!line) return prevCart;

      // เช็คสต็อกล่าสุดบนตู้
      if (line.qty >= cap) {
        queueMicrotask(() => {
          callbacksRef.current.onStockLimitReached(`สินค้านี้เหลือสูงสุด ${cap} ชิ้น`);
        });
        return prevCart;
      }

      // ตรวจสอบขีดจำกัดตะกร้า
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

  // ฟังก์ชันลดจำนวนสินค้าลงทีละ 1 ชิ้น
  const handleDecrease = useCallback((productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, qty: Math.max(1, item.qty - 1) }
          : item,
      ),
    );
  }, []);

  // ฟังก์ชันลบสินค้าชิ้นนั้นออกจากตะกร้า
  const handleRemove = useCallback((productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  // สร้าง Object KEY-VALUE เพื่อใช้อ้างอิงและแสดงผลปุ่มบวก
  const stockById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.stock])) as Record<number, number>,
    [products],
  );

  // ราคารวมก่อนลดคูปอง
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  // คำนวณเวลาการอุ่นทั้งหมดโดยประมาณ
  const totalHeatingTime = estimateApproxWaitSeconds(
    cart.flatMap((item) => Array.from({ length: item.qty }, () => item)),
  );

  return {
    products,
    cart,
    setCart, // อัปเดตตะกร้าโดยตรง
    isLoadingProducts, // กำลังดึงข้อมูลสินค้าอยู่หรือไม่
    fetchProducts,
    handleAddToCart,
    handleIncrease,
    handleDecrease,
    handleRemove,
    stockById, // ข้อมูลสต็อกดึงเร็วแบบระบุด้วย ID
    totalPrice, // ราคารวมก่อนใช้คูปอง
    totalHeatingTime, // เวลารอการอุ่นรวม
  };
}
