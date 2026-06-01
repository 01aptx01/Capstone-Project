"use client";
interface Props {
  isAfterPayment: boolean;
  phoneNumber: string;
  numpadCountdown: number;
  isMemberLoading: boolean;
  formattedPhone: string;
  numpadError: string | null;
  onClose: () => void;
  onStartHeating: () => void;
  onNumberClick: (num: string) => void;
  onDeleteClick: () => void;
  onConfirmPhone: () => void;
}

export default function NumpadModal({
  isAfterPayment,
  phoneNumber,
  numpadCountdown,
  isMemberLoading,
  formattedPhone,
  numpadError,
  onClose,
  onStartHeating,
  onNumberClick,
  onDeleteClick,
  onConfirmPhone,
}: Props) {
  return (
    <div className="numpad-modal-box" onClick={(e) => e.stopPropagation()}>
      <button
        className="timeout-close-btn"
        onClick={isAfterPayment ? onStartHeating : onClose}
      >
        <span>{numpadCountdown}</span>
        <span className="points-close-icon">&times;</span>
      </button>
      <div className="numpad-modal-body">
        <div className="numpad-title">
          {isAfterPayment
            ? "กรุณากรอกเบอร์เพื่อสะสมแต้ม"
            : "โปรดกรอกหมายเลขโทรศัพท์"}
        </div>
        {numpadError && (
          <div
            className="numpad-modal-error kiosk-alert kiosk-alert--error"
            role="alert"
          >
            {numpadError}
          </div>
        )}
        <div
          className="phone-display"
          style={{ opacity: phoneNumber ? 1 : 0.6 }}
        >
          {formattedPhone}
        </div>
        <div className="numpad-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="numpad-btn"
            onClick={() => onNumberClick(num.toString())}
          >
            {num}
          </button>
        ))}
        <button className="numpad-btn action" onClick={onDeleteClick}>
          DEL
        </button>
        <button
          className="numpad-btn"
          onClick={() => onNumberClick("0")}
        >
          0
        </button>
        <button
          className="numpad-btn action"
          onClick={onConfirmPhone}
          disabled={isMemberLoading}
        >
          {isMemberLoading ? "..." : "OK"}
        </button>
        </div>
        {isAfterPayment && (
          <button
            type="button"
            className="modal-back-btn numpad-skip-link"
            onClick={onStartHeating}
          >
            ไม่สะสมแต้ม ข้ามไปยังขั้นตอนการอุ่น
          </button>
        )}
      </div>
    </div>
  );
}
