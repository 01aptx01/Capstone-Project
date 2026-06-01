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
          <div className="points-member-error-title">ไม่พบสมาชิก</div>
          <p className="points-member-error-msg">{memberError}</p>
        </>
      ) : (
        <>
          {isNewMember && (
            <div className="points-new-member-badge">✨ ยินดีต้อนรับสมาชิกใหม่!</div>
          )}
          <div className="points-title">
            {isAfterPayment ? "ได้รับแต้ม" : "คะแนนสะสมปัจจุบัน"}
          </div>
          {isAfterPayment && earnedPoints > 0 && (
            <div className="points-earned-delta">+{earnedPoints} แต้ม</div>
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
