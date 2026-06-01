"use client";
import Image from "next/image";
import { Check, X } from "lucide-react";
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
  isAgentOnline: boolean;
  hasHardwareTelemetry: boolean;
  processingStatusMessage?: string | null;
  onComplete: () => void;
}

/** แสดงแถบเดียว: อินเทอร์เน็ต > สถานะระบบ (poll) > กำลังเชื่อมต่อตู้ */
type ProcessingBanner =
  | { kind: "internet" }
  | { kind: "status"; message: string }
  | { kind: "hardware" };

export function resolveProcessingBanner(params: {
  isProcessCompleted: boolean;
  isConnected: boolean;
  processingStatusMessage?: string | null;
  isAgentOnline: boolean;
  hasHardwareTelemetry: boolean;
}): ProcessingBanner | null {
  if (params.isProcessCompleted) return null;
  if (!params.isConnected) return { kind: "internet" };
  if (params.processingStatusMessage) {
    return { kind: "status", message: params.processingStatusMessage };
  }
  if (!params.isAgentOnline && !params.hasHardwareTelemetry) {
    return { kind: "hardware" };
  }
  return null;
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
  isAgentOnline,
  hasHardwareTelemetry,
  processingStatusMessage,
  onComplete,
}: Props) {
  const isErrorState = isProcessCompleted && !isProcessSuccess;
  const banner = resolveProcessingBanner({
    isProcessCompleted,
    isConnected,
    processingStatusMessage,
    isAgentOnline,
    hasHardwareTelemetry,
  });

  return (
    <div
      className={`processing-modal-box${isErrorState ? " processing-modal-box--error" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {banner?.kind === "internet" && (
        <div className="processing-status-banner processing-status-banner--internet">
          ⚠️ สัญญาณอินเทอร์เน็ตขัดข้อง กำลังพยายามเชื่อมต่อใหม่...
        </div>
      )}
      {banner?.kind === "status" && (
        <div className="processing-status-banner processing-status-banner--status">
          {banner.message}
        </div>
      )}
      {banner?.kind === "hardware" && (
        <div className="processing-status-banner processing-status-banner--hardware">
          ⏳ กำลังเชื่อมต่อตู้ฮาร์ดแวร์...
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
      {isErrorState ? (
        <div className="processing-center-area processing-center-area--error">
          <div className="processing-error-content">
            <div className="processing-error-icon" aria-hidden>
              <X size={72} strokeWidth={3} color="#ef4444" />
            </div>
            <p className="processing-error-line">กรุณาติดต่อพนักงานเพื่อขอคืนเงิน</p>
            <p className="processing-error-line processing-error-phone">
              โทร: 02-XXX-XXXX
            </p>
            <p className="processing-error-ref">
              รหัสอ้างอิง: {activeJobId || "-"}
            </p>
          </div>
        </div>
      ) : (
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

          <div className="processing-illustration-wrap">
            <div
              className={`bun-illustration ${currentStep === 3 ? "ready" : ""}`}
            >
              {currentStep === 3 ? (
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
      )}

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
            type="button"
            className={`modal-confirm-btn${!isProcessSuccess ? " modal-confirm-btn--processing-error" : ""}`}
            onClick={onComplete}
          >
            {!isProcessSuccess ? "กลับสู่หน้าหลัก" : "หยิบสินค้าเรียบร้อยแล้ว"}
          </button>
        )}
      </div>
    </div>
  );
}
