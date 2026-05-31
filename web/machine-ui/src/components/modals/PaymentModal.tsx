"use client";
import Image from "next/image";
import {
  CreditCard,
  Nfc,
  Smartphone,
  ScanLine,
  BanknoteArrowUp,
} from "lucide-react";
import type { PaymentMethod, TestCardBrand } from "../../types";
import { testBtnStyle } from "../../constants";

interface Props {
  selectedPaymentMethod: PaymentMethod | null;
  paymentStep: 1 | 2;
  paymentCountdown: number;
  isOmiseLoaded: boolean;
  realQrCode: string | null;
  isProcessingPayment: boolean;
  isNfcBlocked: boolean;
  isCancelPaymentConfirmOpen: boolean;
  onAttemptClose: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onDirectPromptPay: () => void;
  onDirectTrueMoney: () => void;
  onProceedToTap: () => void;
  onSimulateNfcTap: (brand: TestCardBrand) => void;
  onSimulatePromptPaySuccess: () => void;
  onDismissCancelConfirm: () => void;
  onConfirmCancel: () => void;
  onChangeMethod: () => void;
  setPaymentCountdown: (v: number) => void;
}

export default function PaymentModal({
  selectedPaymentMethod,
  paymentStep,
  paymentCountdown,
  isOmiseLoaded,
  realQrCode,
  isProcessingPayment,
  isNfcBlocked,
  isCancelPaymentConfirmOpen,
  onAttemptClose,
  onSelectMethod,
  onDirectPromptPay,
  onDirectTrueMoney,
  onProceedToTap,
  onSimulateNfcTap,
  onSimulatePromptPaySuccess,
  onDismissCancelConfirm,
  onConfirmCancel,
  onChangeMethod,
  setPaymentCountdown,
}: Props) {
  const nfcDisabled = isProcessingPayment || isNfcBlocked;

  return (
    <>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="timeout-close-btn danger"
          onClick={onAttemptClose}
        >
          <span>{paymentCountdown}</span>
          <span style={{ fontSize: "28px", lineHeight: 1 }}>&times;</span>
        </button>
        <div className="payment-wrapper">
          {/* --- Step 0: เลือกช่องทางชำระเงิน --- */}
          {selectedPaymentMethod === null && (
            <>
              <div className="modal-title">โปรดเลือกวิธีการชำระเงิน</div>
              <div className="modal-payment">
                <div className="modal-payment-column">
                  <button
                    className="modal-action-payment-btn"
                    onClick={() => onSelectMethod("promptpay")}
                    disabled={!isOmiseLoaded}
                  >
                    <Image
                      className="payment-logo"
                      src="/payment/PromptPay-logo.png"
                      alt="PromptPay"
                      width={150}
                      height={85}
                      priority
                    />
                  </button>
                  <button
                    className="modal-action-payment-btn"
                    onClick={() => onSelectMethod("truemoney")}
                    disabled={!isOmiseLoaded}
                  >
                    <Image
                      src="/payment/Truemoney-logo.png"
                      alt="Truemoney"
                      width={145}
                      height={30}
                      priority
                    />
                  </button>
                </div>
                <div>
                  <button
                    className="modal-action-payment-btn modal-action-payment-card-btn"
                    onClick={() => onSelectMethod("card")}
                    disabled={!isOmiseLoaded}
                  >
                    <div className="card-btn-content">
                      <div className="card-btn-info">
                        <div className="card-btn-title">Tap to Pay</div>
                        <div className="card-btn-subtitle">
                          NFC / Credit Card
                        </div>
                      </div>
                      <div className="card-btn-icons">
                        <Nfc size={32} strokeWidth={1.5} />
                        <CreditCard size={32} strokeWidth={1.5} />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* --- Flow A: PromptPay --- */}
          {selectedPaymentMethod === "promptpay" && (
            <>
              <div className="payment-title">ชำระเงินด้วย PromptPay</div>
              {/* Step 1: แนะนำ */}
              {paymentStep === 1 && (
                <>
                  <div className="payment-instruction-list">
                    <p>
                      <Smartphone size={20} color="#f89025" /> 1.
                      เปิดแอปพลิเคชันธนาคารของคุณ
                    </p>
                    <p>
                      <ScanLine size={20} color="#f89025" /> 2. เลือกเมนู
                      &quot;สแกน QR Code&quot;
                    </p>
                    <p>
                      <BanknoteArrowUp size={20} color="#f89025" /> 3.
                      สแกนเพื่อชำระเงินในหน้าถัดไป
                    </p>
                  </div>
                  <button
                    className="modal-confirm-btn"
                    onClick={() => {
                      setPaymentCountdown(180);
                      onDirectPromptPay();
                    }}
                  >
                    รับทราบ และแสดง QR Code
                  </button>
                </>
              )}
              {/* Step 2: แสดง QR Code */}
              {paymentStep === 2 && (
                <>
                  {realQrCode ? (
                    <img
                      src={realQrCode}
                      alt="PromptPay QR"
                      width={200}
                      height={200}
                      style={{ borderRadius: "12px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 200,
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1f5f9",
                        borderRadius: "12px",
                        color: "#64748b",
                      }}
                    >
                      กำลังสร้าง QR Code...
                    </div>
                  )}
                  <button
                    style={testBtnStyle}
                    onClick={onSimulatePromptPaySuccess}
                  >
                    [Test] จำลองโอนเงินสำเร็จ
                  </button>
                </>
              )}
            </>
          )}

          {/* --- Flow B: Tap to Pay (NFC / Credit Card) --- */}
          {selectedPaymentMethod === "card" && (
            <>
              <div className="payment-title">
                ชำระเงินด้วย Credit / Debit Card
              </div>
              {/* Step 1: แนะนำ */}
              {paymentStep === 1 && (
                <>
                  <div className="payment-instruction-list">
                    <p>
                      <CreditCard size={20} color="#f89025" /> 1.
                      เตรียมบัตรของคุณให้พร้อม
                    </p>
                    <p>
                      <Nfc size={20} color="#f89025" /> 2.
                      แตะบัตรที่เครื่องรับชำระเงินด้านล่างหน้าจอ
                    </p>
                    <p>
                      <BanknoteArrowUp size={20} color="#f89025" /> 3.
                      รอสัญญาณเสียงเพื่อเสร็จสิ้นรายการ
                    </p>
                  </div>
                  <div className="supported-cards-row">
                    <Image
                      src="/payment/Visa-logo.png"
                      alt="Visa"
                      width={40}
                      height={24}
                    />
                    <Image
                      src="/payment/Mastercard-logo.png"
                      alt="Mastercard"
                      width={40}
                      height={24}
                    />
                    <Image
                      src="/payment/UnionPay-logo.png"
                      alt="UnionPay"
                      width={40}
                      height={24}
                    />
                  </div>
                  <button
                    className="modal-confirm-btn"
                    onClick={onProceedToTap}
                  >
                    ดำเนินการแตะบัตร / จ่ายด้วย NFC
                  </button>
                </>
              )}

              {/* Step 2: แอนิเมชันรอแตะบัตร */}
              {paymentStep === 2 && (
                <>
                  <div className="nfc-pulse-container">
                    <div className="nfc-icon-wrapper">
                      <Nfc size={64} strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 style={{ color: "#f89025", marginBottom: "5px" }}>
                    กำลังรอการแตะบัตร...
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>
                    กรุณานำบัตรมาแตะที่เครื่องอ่านด้านล่าง
                  </p>
                  {/* กดเพื่อจำลองการแตะบัตร NFC */}
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    {(
                      ["visa", "mastercard", "unionpay"] as TestCardBrand[]
                    ).map((brand) => (
                      <button
                        key={brand}
                        style={{
                          ...testBtnStyle,
                          width: "120px",
                          opacity: nfcDisabled ? 0.5 : 1,
                        }}
                        onClick={() => onSimulateNfcTap(brand)}
                        disabled={nfcDisabled}
                      >
                        {brand === "visa"
                          ? "Visa"
                          : brand === "mastercard"
                            ? "Mastercard"
                            : "UnionPay"}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* --- Flow C: TrueMoney (QR) --- */}
          {selectedPaymentMethod === "truemoney" && (
            <>
              <div className="payment-title">ชำระเงินด้วย TrueMoney</div>
              {paymentStep === 1 && (
                <>
                  <div className="payment-instruction-list">
                    <p>
                      <Smartphone size={20} color="#f89025" /> 1. เปิดแอป
                      TrueMoney Wallet
                    </p>
                    <p>
                      <ScanLine size={20} color="#f89025" /> 2.
                      เลือกเมนูสแกนจ่าย
                    </p>
                    <p>
                      <BanknoteArrowUp size={20} color="#f89025" /> 3. สแกน
                      QR ในหน้าถัดไป
                    </p>
                  </div>
                  <button
                    className="modal-confirm-btn"
                    onClick={() => {
                      setPaymentCountdown(180);
                      onDirectTrueMoney();
                    }}
                  >
                    รับทราบ และแสดง QR Code
                  </button>
                </>
              )}
              {paymentStep === 2 && (
                <>
                  {realQrCode ? (
                    <img
                      src={realQrCode}
                      alt="TrueMoney QR"
                      width={200}
                      height={200}
                      style={{ borderRadius: "12px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 200,
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1f5f9",
                        borderRadius: "12px",
                        color: "#64748b",
                      }}
                    >
                      กำลังสร้าง QR Code...
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ปุ่มย้อนกลับ */}
          {selectedPaymentMethod !== null && paymentStep === 1 && (
            <button className="modal-back-btn" onClick={onChangeMethod}>
              เปลี่ยนช่องทางการชำระเงิน
            </button>
          )}
        </div>
      </div>

      {/* --- Cancel Payment Confirm Dialog --- */}
      {isCancelPaymentConfirmOpen && (
        <div
          className="confirm-overlay"
          onClick={(e) => {
            e.stopPropagation();
            onDismissCancelConfirm();
          }}
        >
          <div
            className="confirm-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-title">ยืนยันการยกเลิก</div>
            <div className="confirm-desc">
              ต้องการยกเลิกการชำระเงินและกลับไปหน้าเลือกสินค้าใช่หรือไม่?
            </div>
            <div className="confirm-actions">
              <button
                className="confirm-btn modal-action-btn"
                onClick={onDismissCancelConfirm}
              >
                กลับไปชำระเงิน
              </button>
              <button
                className="confirm-btn danger"
                onClick={onConfirmCancel}
              >
                ยกเลิกการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
