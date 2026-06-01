"use client";
interface Props {
  onClose: () => void;
  onOpenUsage: () => void;
  onOpenNumpad: () => void;
  onOpenContact: () => void;
}

export default function InfoModal({ onClose, onOpenUsage, onOpenNumpad, onOpenContact }: Props) {
  return (
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close-btn" onClick={onClose}>
        &times;
      </button>
      <button className="modal-action-btn" onClick={onOpenUsage}>
        วิธีการใช้งาน
      </button>
      <button className="modal-action-btn" onClick={onOpenNumpad}>
        ตรวจสอบคะแนน
      </button>
      <button className="modal-action-btn" onClick={onOpenContact}>
        รายงานปัญหา
      </button>
    </div>
  );
}
