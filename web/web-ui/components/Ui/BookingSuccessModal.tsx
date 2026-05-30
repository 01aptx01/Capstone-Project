import { Button, ModalSheet } from "@/components/Ui";

interface BookingSuccessModalProps {
  onConfirm: () => void;
  onClose?: () => void;
}

export function BookingSuccessModal({
  onConfirm,
  onClose,
}: BookingSuccessModalProps) {
  return (
    <ModalSheet open onClose={onClose ?? onConfirm}>
      <div className="px-8 pb-8 text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-3">
          จองสำเร็จ!
        </h3>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          ซาลาเปาแสนอร่อยรอคุณอยู่
          <br />
          กรุณานำ QR Code ในหน้าประวัติ
          <br />
          <span className="font-bold text-brand">
            ไปสแกนรับที่ตู้ MOD PAO ได้เลยครับ
          </span>
        </p>
        <Button
          fullWidth
          size="lg"
          className="bg-success hover:opacity-90 shadow-none"
          onClick={onConfirm}
        >
          ดูประวัติการจอง
        </Button>
      </div>
    </ModalSheet>
  );
}
