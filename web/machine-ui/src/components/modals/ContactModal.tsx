"use client";
import { PhoneCall } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function ContactModal({ onClose }: Props) {
  return (
    <div className="report-modal-box" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close-btn" onClick={onClose}>
        &times;
      </button>
      <div className="report-title">ติดต่อเจ้าหน้าที่</div>
      {/* เบอร์โทรศัพท์ */}
      <div className="report-phone">
        <PhoneCall />
        02-123-4567
      </div>
      <div className="report-divider">หรือ</div>
      {/* โซน LINE สำหรับสแกนแจ้งปัญหา */}
      <div className="line-report-section">
        <div className="qr-placeholder">
          {/* จำลอง QR Code ด้วย Icon Line และภาพตัวอย่าง */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                color: "#22c55e",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              LINE
            </div>
            <div style={{ fontSize: "10px" }}>SCAN ME</div>
          </div>
        </div>
        <div className="line-id-text">ID: @MOD.PAO</div>
        <div className="scan-text">
          สแกนเพื่อติดต่อเจ้าหน้าที่โดยตรง
        </div>
      </div>
    </div>
  );
}
