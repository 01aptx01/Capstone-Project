import { Button, ModalSheet } from "@/components/Ui";

interface CancelConfirmModalProps {
  orderNumber: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelConfirmModal({
  orderNumber,
  onConfirm,
  onClose,
}: CancelConfirmModalProps) {
  return (
    <ModalSheet open onClose={onClose}>
      <div className="px-6 pb-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl" aria-hidden>
            !
          </span>
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          ยกเลิกคำสั่งซื้อ?
        </h3>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          คุณต้องการยกเลิกคำสั่งซื้อ{" "}
          <span className="font-bold text-foreground">#{orderNumber}</span>{" "}
          ใช่หรือไม่? เมื่อยกเลิกแล้วจะไม่สามารถกู้คืนได้
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            ย้อนกลับ
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>
            ยืนยันยกเลิก
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
