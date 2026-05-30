import { Button, ModalSheet } from "@/components/Ui";

export function CartFullModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalSheet open onClose={onClose}>
      <div className="px-6 pb-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 text-destructive text-4xl">
          🛒
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-3">
          ตะกร้าเต็มแล้ว!
        </h3>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          คุณสามารถจองล่วงหน้าได้สูงสุด{" "}
          <span className="font-bold text-brand text-base">3 ชิ้น</span> ต่อ 1
          คำสั่งซื้อเท่านั้น
        </p>
        <Button
          fullWidth
          className="bg-foreground hover:opacity-90"
          onClick={onClose}
        >
          ตกลง
        </Button>
      </div>
    </ModalSheet>
  );
}
