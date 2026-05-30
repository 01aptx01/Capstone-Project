"use client";

interface Props {
  isAfterPayment: boolean;
  memberError: string | null;
  isNewMember: boolean;
  earnedPoints: number;
  memberPoints: number | null;
  pointsCountdown: number;
  onClose: () => void;
  onStartHeating: () => void;
}

export default function PointsResultModal({
  isAfterPayment,
  memberError,
  isNewMember,
  earnedPoints,
  memberPoints,
  pointsCountdown,
  onClose,
  onStartHeating,
}: Props) {
  return (
    <div className="points-modal-box" onClick={(e) => e.stopPropagation()}>
      <button
        className="timeout-close-btn"
        onClick={isAfterPayment ? onStartHeating : onClose}
      >
        <span>{pointsCountdown}</span>
        <span className="points-close-icon">&times;</span>
      </button>

      {memberError ? (
        <>
          <div className="points-title" style={{ color: "#ef4444" }}>
            ❌ ไม่พบสมาชิก
          </div>
          <div
            className="points-disclaimer"
            style={{ marginTop: "16px", fontSize: "16px" }}
          >
            {memberError}
          </div>
        </>
      ) : (
        <>
          {isNewMember && (
            <div
              style={{
                background: "linear-gradient(135deg, #f89025, #f59e0b)",
                color: "white",
                borderRadius: "20px",
                padding: "6px 18px",
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              ✨ ยินดีต้อนรับสมาชิกใหม่!
            </div>
          )}
          <div className="points-title">
            {isAfterPayment ? "ได้รับแต้ม" : "คะแนนสะสมปัจจุบัน"}
          </div>
          {isAfterPayment && earnedPoints > 0 && (
            <div
              style={{
                color: "#22c55e",
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              +{earnedPoints} แต้ม
            </div>
          )}
          <div className="points-value">{memberPoints ?? 0}</div>
          <div className="points-unit">คะแนน</div>
          <div className="points-disclaimer">
            <strong>*คะแนนสามารถนำไปแลกเป็นส่วนลดหรือโปรโมชั่น*</strong>
            <br />
            ได้ทางเว็บไซต์ MODPAO.com
          </div>
        </>
      )}
    </div>
  );
}
