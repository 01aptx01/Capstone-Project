"use client";

export type HardwareGateVariant =
  | "internet"
  | "hardware"
  | "order_busy"
  | "order_pending_recovery";

interface Props {
  visible: boolean;
  variant: HardwareGateVariant;
  onResumePayment?: () => void;
  onCancelPendingOrder?: () => void;
}

const COPY: Record<
  HardwareGateVariant,
  { title: string; subtitle: string; hint?: string }
> = {
  internet: {
    title: "สัญญาณขัดข้องชั่วคราว",
    subtitle: "กำลังพยายามเชื่อมต่อเซิร์ฟเวอร์...",
  },
  hardware: {
    title: "ระบบขัดข้องชั่วคราว",
    subtitle: "กำลังพยายามเชื่อมต่อตู้...",
  },
  order_busy: {
    title: "ตู้กำลังดำเนินการออเดอร์ก่อนหน้า",
    subtitle: "กรุณารอจนกว่าจะจ่ายสินค้าเสร็จ หรือลองใหม่อีกครั้งในไม่ช้า",
  },
  order_pending_recovery: {
    title: "มีรายการชำระเงินค้างอยู่",
    subtitle:
      "หากคุณกำลังชำระเงินอยู่ กดดำเนินการต่อ หากต้องการยกเลิกรายการนี้กดยกเลิกรายการ",
    hint: "หากชำระเงินแล้วแต่ระบบไม่อัปเดต กรุณาติดต่อเจ้าหน้าที่",
  },
};

export default function HardwareGateOverlay({
  visible,
  variant,
  onResumePayment,
  onCancelPendingOrder,
}: Props) {
  if (!visible) return null;

  const { title, subtitle, hint } = COPY[variant];

  return (
    <div
      className="hardware-gate-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="hardware-gate-title"
      aria-describedby="hardware-gate-subtitle"
    >
      <div className="hardware-gate-card">
        {variant !== "order_pending_recovery" && (
          <div className="hardware-gate-spinner" aria-hidden />
        )}
        <h2 id="hardware-gate-title" className="hardware-gate-title">
          {title}
        </h2>
        <p id="hardware-gate-subtitle" className="hardware-gate-subtitle">
          {subtitle}
        </p>
        {hint && (
          <p className="hardware-gate-hint hardware-gate-hint--recovery">
            {hint}
          </p>
        )}
        {variant === "order_pending_recovery" ? (
          <div className="hardware-gate-actions">
            <button
              type="button"
              className="hardware-gate-btn hardware-gate-btn--primary"
              onClick={onResumePayment}
            >
              ดำเนินการต่อ
            </button>
            <button
              type="button"
              className="hardware-gate-btn hardware-gate-btn--secondary"
              onClick={onCancelPendingOrder}
            >
              ยกเลิกรายการ
            </button>
          </div>
        ) : (
          <p className="hardware-gate-hint">กรุณารอสักครู่</p>
        )}
      </div>
    </div>
  );
}
