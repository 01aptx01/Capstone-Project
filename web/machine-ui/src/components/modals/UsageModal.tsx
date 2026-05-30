"use client";
import { SquareDashedMousePointer, CreditCard, BanknoteArrowUp, PackageOpen } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function UsageModal({ onClose }: Props) {
  return (
    <div className="usage-modal-box" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close-btn" onClick={onClose}>
        &times;
      </button>
      <div className="modal-title">วิธีการใช้งาน</div>
      <div className="usage-list">
        <div className="usage-item">
          <span className="usage-number">1.</span>
          <div className="usage-icon-placeholder">
            <SquareDashedMousePointer />
          </div>
          <span className="usage-text">เลือกสินค้าที่ต้องการ</span>
        </div>
        <div className="usage-item">
          <span className="usage-number">2.</span>
          <div className="usage-icon-placeholder">
            <CreditCard />
          </div>
          <span className="usage-text">เลือกช่องทางการชำระเงิน</span>
        </div>
        <div className="usage-item">
          <span className="usage-number">3.</span>
          <div className="usage-icon-placeholder">
            <BanknoteArrowUp />
          </div>
          <span className="usage-text">ชำระเงินตามจำนวน</span>
        </div>
        <div className="usage-item">
          <span className="usage-number">4.</span>
          <div className="usage-icon-placeholder">
            <PackageOpen />
          </div>
          <span className="usage-text">รับสินค้า</span>
        </div>
      </div>
    </div>
  );
}
