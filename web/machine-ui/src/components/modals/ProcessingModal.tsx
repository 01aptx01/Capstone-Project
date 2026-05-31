"use client";
import Image from "next/image";
import { Check } from "lucide-react";
import type { Product } from "../../types";
import { PROCESS_STEPS } from "../../constants";

interface Props {
  queue: Product[];
  currentStep: number;
  currentItemIndex: number;
  isDispensingItem: boolean;
  globalTimeLeft: number;
  isProcessCompleted: boolean;
  isProcessSuccess: boolean;
  isMultiFlavor: boolean;
  hasStartedServing: boolean;
  progressLineWidth: string;
  activeJobId: string | null;
  isConnected: boolean;
  onComplete: () => void;
}

export default function ProcessingModal({
  queue,
  currentStep,
  currentItemIndex,
  isDispensingItem,
  globalTimeLeft,
  isProcessCompleted,
  isProcessSuccess,
  isMultiFlavor,
  hasStartedServing,
  progressLineWidth,
  activeJobId,
  isConnected,
  onComplete,
}: Props) {
  return (
    <div
      className="processing-modal-box"
      onClick={(e) => e.stopPropagation()}
    >
      {!isConnected && !isProcessCompleted && (
        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px', textAlign: 'center', fontSize: '14px', borderRadius: '16px 16px 0 0' }}>
          ⚠️ สัญญาณอินเทอร์เน็ตขัดข้อง กำลังพยายามเชื่อมต่อใหม่...
        </div>
      )}
      {/* ส่วนหัว */}
      <div
        className={`processing-header ${isProcessSuccess ? "success-theme" : isProcessCompleted && !isProcessSuccess ? "error-theme" : ""}`}
      >
        <div className="processing-title">
          {isProcessSuccess ? "ทานให้อร่อยนะครับ!" : isProcessCompleted && !isProcessSuccess ? "ระบบขัดข้องชั่วคราว" : "กรุณารอสักครู่..."}
        </div>
        <div className="processing-subtitle">
          {isProcessSuccess
            ? "🎉 สินค้าของคุณพร้อมแล้ว!"
            : isProcessCompleted && !isProcessSuccess
            ? "ขออภัยในความไม่สะดวก"
            : PROCESS_STEPS[currentStep]}
        </div>
      </div>

      {/* ส่วนกลาง */}
      <div className="processing-center-area">
        {currentStep < 3 && (
          <div className="countdown-timer">
            {globalTimeLeft >= 60 ? (
              <>
                {Math.floor(globalTimeLeft / 60)}:
                {String(globalTimeLeft % 60).padStart(2, "0")}
                <span className="countdown-label">นาทีที่เหลือ</span>
              </>
            ) : (
              <>
                {globalTimeLeft}
                <span className="countdown-label">วินาทีที่เหลือ</span>
              </>
            )}

            {/* แสดงบอกสถานะคิว */}
            {(currentStep === 1 || currentStep === 2) &&
              queue.length > 0 &&
              isDispensingItem && (
                <div
                  key={`status-${currentItemIndex}`}
                  className="current-queue-status"
                  style={{ animation: "fadeSwitch 0.4s ease-out forwards" }}
                >
                  ♨️ กำลังเสิร์ฟ: {queue[currentItemIndex]?.name}
                </div>
              )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className={`bun-illustration ${currentStep === 3 ? "ready" : ""}`}
          >
            {isProcessCompleted && !isProcessSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '80px', marginBottom: '10px' }}>❌</div>
                <div style={{ fontSize: '18px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
                  กรุณาติดต่อพนักงานเพื่อขอคืนเงิน<br/>
                  โทร: 02-XXX-XXXX<br/>
                  <br/>
                  <span style={{ fontWeight: 'bold', color: '#ef4444' }}>รหัสอ้างอิง: {activeJobId || "-"}</span>
                </div>
              </div>
            ) : currentStep === 3 ? (
              <Image
                src="/Pao.png"
                alt="Completed Bun"
                width={190}
                height={190}
              />
            ) : (
              <>
                <span className="bun-smoke">♨️</span>
                <Image
                  src="/Pao.png"
                  alt="Heating Bun"
                  width={160}
                  height={160}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ส่วนล่าง */}
      <div
        className={`processing-bottom-area ${isProcessSuccess ? "success-theme" : isProcessCompleted && !isProcessSuccess ? "error-theme" : ""}`}
      >
        {!isProcessCompleted ? (
          <div className="stepper-container">
            {/* ส่วนของเส้นความคืบหน้า */}
            <div
              className="stepper-progress-line"
              style={{
                width: progressLineWidth,
                transition: "width 0.5s ease-in-out",
              }}
            ></div>

            {PROCESS_STEPS.map((stepName, index) => {
              let isActive = index === currentStep;
              let isCompleted = index < currentStep;

              // 1. Multi-flavor + heating + serving started → Step2 & Step3 both active/white
              if (
                currentStep === 1 &&
                isMultiFlavor &&
                hasStartedServing
              ) {
                if (index === 1 || index === 2) {
                  isActive = true;
                  isCompleted = false;
                }
              }

              // 2. Final bun serving (currentStep === 2) → Step2 gets checkmark
              if (currentStep === 2 && index === 1) {
                isActive = false;
                isCompleted = true;
              }

              // 3. Step 4 ready (currentStep === 3) → Steps 1-3 all get checkmarks
              if (currentStep === 3) {
                if (index < 3) {
                  isActive = false;
                  isCompleted = true;
                } else {
                  isActive = true;
                  isCompleted = false;
                }
              }

              return (
                <div
                  key={index}
                  className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                >
                  <div className="step-circle">
                    {isCompleted ? (
                      <Check size={24} strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="step-label">{stepName}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <button
            className="modal-confirm-btn"
            style={{ fontSize: "24px", padding: "15px 50px", backgroundColor: !isProcessSuccess ? '#ef4444' : undefined }}
            onClick={onComplete}
          >
            {!isProcessSuccess ? "กลับสู่หน้าหลัก" : "หยิบสินค้าเรียบร้อยแล้ว"}
          </button>
        )}
      </div>
    </div>
  );
}
