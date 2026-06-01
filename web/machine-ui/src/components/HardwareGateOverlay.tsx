"use client";

export type HardwareGateVariant = "internet" | "hardware" | "order_busy";

interface Props {
  visible: boolean;
  variant: HardwareGateVariant;
}

const COPY: Record<
  HardwareGateVariant,
  { title: string; subtitle: string }
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
};

export default function HardwareGateOverlay({ visible, variant }: Props) {
  if (!visible) return null;

  const { title, subtitle } = COPY[variant];

  return (
    <div
      className="hardware-gate-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="hardware-gate-title"
      aria-describedby="hardware-gate-subtitle"
    >
      <div className="hardware-gate-card">
        <div className="hardware-gate-spinner" aria-hidden />
        <h2 id="hardware-gate-title" className="hardware-gate-title">
          {title}
        </h2>
        <p id="hardware-gate-subtitle" className="hardware-gate-subtitle">
          {subtitle}
        </p>
        <p className="hardware-gate-hint">กรุณารอสักครู่</p>
      </div>
    </div>
  );
}
