"use client";
import { PackageOpen } from "lucide-react";
import { MAX_CART_ITEMS } from "../../constants";

interface Props {
  type: "cart_full" | "stock_limit" | "min_payment";
  message?: string;
  onClose: () => void;
}

export default function LimitWarningModal({ type, message, onClose }: Props) {
  const isCartFull = type === "cart_full";
  const isMinPayment = type === "min_payment";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="points-modal-box limit-warning-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`limit-warning-icon-wrap ${
            isCartFull
              ? "limit-warning-icon-wrap--cart"
              : isMinPayment
                ? "limit-warning-icon-wrap--cart"
                : "limit-warning-icon-wrap--stock"
          }`}
        >
          <PackageOpen
            size={40}
            color={isCartFull || isMinPayment ? "#ef4444" : "#d97706"}
          />
        </div>

        <h2 className="limit-warning-title">
          {isCartFull
            ? "ตะกร้าเต็มแล้ว!"
            : isMinPayment
              ? "ยอดชำระไม่ถึงขั้นต่ำ"
              : "จำนวนสินค้าไม่พอ"}
        </h2>

        <p className="limit-warning-desc">
          {isCartFull
            ? `ขออภัยครับ 1 คำสั่งซื้อสามารถซื้อสินค้าได้สูงสุด ${MAX_CART_ITEMS} ชิ้นเท่านั้น`
            : isMinPayment
              ? message
              : message || "ไม่สามารถเพิ่มเกินจำนวนที่มีในตู้ได้"}
        </p>

        <button type="button" className="limit-warning-btn" onClick={onClose}>
          ตกลง
        </button>
      </div>
    </div>
  );
}
