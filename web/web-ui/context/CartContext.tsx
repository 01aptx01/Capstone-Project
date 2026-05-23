// context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import type { AppliedCoupon } from "@/lib/api/buy";
import { cancelPayment } from "@/lib/api/buy";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

type OrderStatus = "idle" | "pending" | "completed";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPrice: number;
  payableTotal: number;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  addToCart: (
    e: React.MouseEvent<HTMLButtonElement>,
    item: Omit<CartItem, "qty">,
  ) => void;
  updateQty: (id: string | number, delta: number) => void;
  removeItem: (id: string | number) => void;
  clearCart: () => void;

  orderStatus: OrderStatus;
  paymentMethod: string | null;
  chargeId: string | null;
  qrCode: string | null;
  setCheckoutResult: (chargeId: string, qrCode: string | null) => void;
  timeLeft: number;
  startCheckout: (method: string) => void;
  cancelOrder: () => Promise<void>;
  completeOrder: () => void;
  showCartFullToast: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [animations, setAnimations] = useState<
    { id: number; x: number; y: number; img?: string }[]
  >([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(1800);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showCartFullToast, setShowCartFullToast] = useState(false);
  const pendingAddCount = useRef(0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const payableTotal = useMemo(() => {
    if (appliedCoupon && cartItems.length > 0) return appliedCoupon.final_thb;
    return totalPrice;
  }, [appliedCoupon, cartItems.length, totalPrice]);

  const triggerCartFullToast = useCallback(() => {
    setShowCartFullToast(true);
    setTimeout(() => setShowCartFullToast(false), 5000);
  }, []);

  const startCheckout = (method: string) => {
    setOrderStatus("pending");
    setPaymentMethod(method);
    setChargeId(null);
    setQrCode(null);
    setTimeLeft(1800);
  };

  const setCheckoutResult = (nextChargeId: string, nextQr: string | null) => {
    setChargeId(nextChargeId);
    setQrCode(nextQr);
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const cancelOrder = async () => {
    if (chargeId) {
      try {
        await cancelPayment(chargeId);
      } catch {
        // order may already be paid/cancelled
      }
    }
    setOrderStatus("idle");
    setPaymentMethod(null);
    setChargeId(null);
    setQrCode(null);
    setTimeLeft(1800);
    clearCart();
  };

  const completeOrder = () => {
    setOrderStatus("completed");
    setPaymentMethod(null);
    setChargeId(null);
    setQrCode(null);
    clearCart();
    setTimeout(() => setOrderStatus("idle"), 2000);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (orderStatus === "pending" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (orderStatus === "pending" && timeLeft <= 0) {
      setShowTimeoutModal(true);
      void cancelOrder();
    }
    return () => clearTimeout(timer);
  }, [orderStatus, timeLeft]);

  const addToCart = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      item: Omit<CartItem, "qty">,
    ) => {
      if (orderStatus === "pending") {
        alert(
          "กรุณาชำระเงินรายการปัจจุบันให้เสร็จสิ้น หรือยกเลิกรายการก่อนครับ",
        );
        return;
      }

      if (cartCount + pendingAddCount.current >= 3) {
        triggerCartFullToast();
        return;
      }

      pendingAddCount.current += 1;
      const rect = e.currentTarget.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const animId = Date.now();
      setAnimations((prev) => [
        ...prev,
        { id: animId, x: startX, y: startY, img: item.image },
      ]);

      setTimeout(() => {
        setCartItems((prev) => {
          const existingItem = prev.find((p) => p.id === item.id);
          if (existingItem) {
            return prev.map((p) =>
              p.id === item.id ? { ...p, qty: p.qty + 1 } : p,
            );
          }
          return [...prev, { ...item, qty: 1 }];
        });
        setAnimations((prev) => prev.filter((anim) => anim.id !== animId));
        pendingAddCount.current -= 1;
      }, 600);
    },
    [cartCount, orderStatus, triggerCartFullToast],
  );

  const updateQty = (id: string | number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (delta > 0 && cartCount >= 3) {
            triggerCartFullToast();
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const removeItem = (id: string | number) =>
    setCartItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        totalPrice,
        payableTotal,
        appliedCoupon,
        setAppliedCoupon,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        orderStatus,
        paymentMethod,
        chargeId,
        qrCode,
        setCheckoutResult,
        timeLeft,
        startCheckout,
        cancelOrder,
        completeOrder,
        showCartFullToast,
      }}
    >
      {children}

      {showTimeoutModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="w-16 h-16 mx-auto bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              หมดเวลาชำระเงิน
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              ระบบได้ยกเลิกรายการเนื่องจากหมดเวลาในการชำระเงิน
            </p>
            <button
              onClick={() => setShowTimeoutModal(false)}
              className="w-full bg-[#FF8A33] text-white font-bold py-3.5 rounded-xl hover:bg-orange-500 transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flyToCart {
          0% { top: var(--startY); left: var(--startX); transform: scale(1); opacity: 1; }
          20% { top: calc(var(--startY) - 40px); transform: scale(1.1); }
          100% { top: calc(100vh - 60px); left: 50vw; transform: scale(0.15); opacity: 0; }
        }
      `}</style>

      {animations.map((anim) => (
        <div
          key={anim.id}
          className="fixed z-[100] w-16 h-16 rounded-xl shadow-2xl pointer-events-none bg-white border-2 border-[#FF8A33] overflow-hidden flex items-center justify-center"
          style={
            {
              "--startX": `${anim.x - 32}px`,
              "--startY": `${anim.y - 32}px`,
              animation:
                "flyToCart 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards",
            } as React.CSSProperties
          }
        >
          {anim.img ? (
            <img
              src={anim.img}
              alt="item"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#FFD1A6] text-2xl flex items-center justify-center">
              🥟
            </div>
          )}
        </div>
      ))}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
