// context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CartFullModal } from "@/components/Ui/CartFullModal";

interface CartContextType {
  cartCount: number;
  // เพิ่มพารามิเตอร์ imgSrc เข้ามา
  addToCart: (e: React.MouseEvent<HTMLButtonElement>, imgSrc?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  
  // เพิ่ม img เข้าไปใน State อนิเมชัน
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number; img?: string }[]>([]);

  const addToCart = useCallback((e: React.MouseEvent<HTMLButtonElement>, imgSrc?: string) => {
    if (cartCount >= 3) {
      setIsFullModalOpen(true);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const id = Date.now();

    // ส่ง imgSrc เข้าไปด้วย
    setAnimations((prev) => [...prev, { id, x: startX, y: startY, img: imgSrc }]);

    setTimeout(() => {
      setCartCount((prev) => prev + 1);
      setAnimations((prev) => prev.filter((anim) => anim.id !== id));
    }, 600);
  }, [cartCount]);

  return (
    <CartContext.Provider value={{ cartCount, addToCart }}>
      {children}
      {isFullModalOpen && <CartFullModal onClose={() => setIsFullModalOpen(false)} />}

      <style>{`
        @keyframes flyToCart {
          0% { top: var(--startY); left: var(--startX); transform: scale(1); opacity: 1; }
          20% { top: calc(var(--startY) - 40px); transform: scale(1.1); }
          100% { top: 20px; left: calc(100vw - 40px); transform: scale(0.15); opacity: 0; }
        }
      `}</style>

      {/* ปรับให้แสดงรูปภาพแทนลูกบอลสีส้ม */}
      {animations.map((anim) => (
        <div
          key={anim.id}
          className="fixed z-[100] w-16 h-16 rounded-xl shadow-2xl pointer-events-none bg-white border-2 border-[#FF8A33] overflow-hidden flex items-center justify-center"
          style={{
            "--startX": `${anim.x - 32}px`,
            "--startY": `${anim.y - 32}px`,
            animation: "flyToCart 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards",
          } as React.CSSProperties}
        >
          {anim.img ? (
            <img src={anim.img} alt="item" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#FFD1A6] text-2xl flex items-center justify-center">🥟</div>
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