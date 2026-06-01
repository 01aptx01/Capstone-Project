"use client";

interface Props {
  disabled?: boolean;
  loading?: boolean;
  onKey: (digit: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
}

export default function NumericKeyboard({
  disabled = false,
  loading = false,
  onKey,
  onDelete,
  onConfirm,
}: Props) {
  return (
    <div className="coupon-numpad" aria-label="แป้นพิมพ์ตัวเลข">
      <div className="coupon-numpad-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            className="coupon-numpad-btn"
            disabled={disabled}
            onClick={() => onKey(String(num))}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          className="coupon-numpad-btn coupon-numpad-btn--action"
          disabled={disabled}
          onClick={onDelete}
        >
          DEL
        </button>
        <button
          type="button"
          className="coupon-numpad-btn"
          disabled={disabled}
          onClick={() => onKey("0")}
        >
          0
        </button>
        <button
          type="button"
          className="coupon-numpad-btn coupon-numpad-btn--ok"
          disabled={disabled}
          onClick={onConfirm}
        >
          {loading ? "..." : "OK"}
        </button>
      </div>
    </div>
  );
}
