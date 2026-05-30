"use client";
import { PackageOpen } from "lucide-react";
import { MAX_CART_ITEMS } from "../../constants";

interface Props {
  type: "cart_full" | "stock_limit";
  message?: string;
  onClose: () => void;
}

export default function LimitWarningModal({ type, message, onClose }: Props) {
  const isCartFull = type === "cart_full";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="points-modal-box"
        style={{
          maxWidth: "400px",
          padding: "40px 20px",
          textAlign: "center",
          background: "white",
          borderRadius: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: isCartFull ? "#fee2e2" : "#fef3c7",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <PackageOpen size={40} color={isCartFull ? "#ef4444" : "#d97706"} />
        </div>

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#1f2937",
            marginBottom: "12px",
          }}
        >
          {isCartFull ? "ตะกร้าเต็มแล้ว!" : "จำนวนสินค้าไม่พอ"}
        </h2>

        <p
          style={{
            fontSize: "18px",
            color: "#6b7280",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          {isCartFull
            ? `ขออภัยครับ 1 คำสั่งซื้อสามารถซื้อสินค้าได้สูงสุด ${MAX_CART_ITEMS} ชิ้นเท่านั้น`
            : message || "ไม่สามารถเพิ่มเกินจำนวนที่มีในตู้ได้"}
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #f89025, #f59e0b)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
          }}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
