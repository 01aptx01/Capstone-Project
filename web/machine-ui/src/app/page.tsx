"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Script from "next/script";
import "./globals.css";

// Types & Constants
import type { ModalType } from "../types";
import { DEFAULT_MACHINE_CODE, NUMPAD_COUNTDOWN_SECONDS } from "../constants";

// Components
import ProductCard from "../components/ProductCard";
import CartSidebar from "../components/CartSidebar";
import CouponModal from "../components/CouponModal";

// Modal Components
import InfoModal from "../components/modals/InfoModal";
import UsageModal from "../components/modals/UsageModal";
import NumpadModal from "../components/modals/NumpadModal";
import PointsResultModal from "../components/modals/PointsResultModal";
import ContactModal from "../components/modals/ContactModal";
import LimitWarningModal from "../components/modals/LimitWarningModal";
import PaymentModal from "../components/modals/PaymentModal";
import ProcessingModal from "../components/modals/ProcessingModal";
import HardwareGateOverlay from "../components/HardwareGateOverlay";

// Custom Hooks
import { useJobSocket } from "../hooks/useJobSocket";
import { useCart } from "../hooks/useCart";
import { useCoupon } from "../hooks/useCoupon";
import { usePayment } from "../hooks/usePayment";
import { useHeatingProcess } from "../hooks/useHeatingProcess";
import { useMember } from "../hooks/useMember";
import { useMachineBusy } from "../hooks/useMachineBusy";

export default function VendingPage() {
  const machineCode = DEFAULT_MACHINE_CODE;

  // PAGE-LEVEL STATE
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [isAfterPayment, setIsAfterPayment] = useState(false);
  const [stockLimitMessage, setStockLimitMessage] = useState("");
  const [chargeIdForSocket, setChargeIdForSocket] = useState<string | null>(null);
  const totalPriceRef = useRef<number>(0);

  // Ref for deferred payment success handler
  const paymentSuccessHandlerRef = useRef<() => void>(() => { });

  // ----- HOOKS -----
  const {
    products, cart, setCart, isLoadingProducts,
    fetchProducts, handleAddToCart, handleIncrease, handleDecrease, handleRemove,
    stockById, totalPrice, totalHeatingTime,
  } = useCart({
    machineCode,
    onCartLimitReached: () => setActiveModal("limit_warning"),
    onStockLimitReached: (msg) => {
      setStockLimitMessage(msg);
      setActiveModal("stock_limit_warning");
    },
  });

  const { appliedCoupon, setAppliedCoupon, payableTotal } = useCoupon(cart, machineCode, totalPrice);

  const isPostPaymentFlow =
    isAfterPayment || activeModal === "processing";

  const [excludeChargeId, setExcludeChargeId] = useState<string | null>(null);

  const { isMachineBusy, refreshMachineBusy } = useMachineBusy({
    machineCode,
    pollEnabled: !isPostPaymentFlow,
    excludeChargeId,
  });

  const {
    agentJobState,
    agentCurrentItemIndex,
    globalTimeLeft: socketGlobalTimeLeft,
    isConnected,
    isAgentOnline,
  } = useJobSocket({
    activeJobId:
      isAfterPayment || activeModal === "processing" ? chargeIdForSocket : null,
  });

  const payment = usePayment({
    activeModal,
    setActiveModal,
    cart,
    payableTotal,
    appliedCoupon,
    machineCode,
    isAgentOnline,
    isMachineBusy,
    refreshMachineBusy,
    onPaymentSuccess: () => paymentSuccessHandlerRef.current(),
  });

  useEffect(() => {
    if (activeModal === "payment") {
      setExcludeChargeId(payment.currentChargeId);
    } else {
      setExcludeChargeId(null);
    }
  }, [activeModal, payment.currentChargeId]);

  useEffect(() => {
    if (isAfterPayment || activeModal === "processing") {
      setChargeIdForSocket(payment.currentChargeId);
    } else {
      setChargeIdForSocket(null);
    }
  }, [isAfterPayment, activeModal, payment.currentChargeId]);

  const heating = useHeatingProcess({
    activeModal,
    setActiveModal,
    isAfterPayment,
    setIsAfterPayment,
    agentJobState,
    agentCurrentItemIndex,
    socketGlobalTimeLeft,
    fetchProducts,
    orderChargeId: payment.currentChargeId,
  });

  const member = useMember({
    activeModal,
    setActiveModal,
    isAfterPayment,
    currentChargeId: payment.currentChargeId,
    totalPriceRef,
    onStartHeating: heating.startHeatingProcess,
  });
  // ----- END HOOKS -----

  // ----- PAYMENT SUCCESS ORCHESTRATOR -----
  paymentSuccessHandlerRef.current = () => {
    const flatQueue = cart.flatMap((item) => Array(item.qty).fill(item));
    flatQueue.sort((a: any, b: any) => a.heatingTime - b.heatingTime);

    const paidTotal = appliedCoupon ? appliedCoupon.final_thb : totalPrice;
    totalPriceRef.current = paidTotal;

    // Set queue and clear cart/coupon
    heating.setQueue(flatQueue);
    setCart([]);
    setAppliedCoupon(null);

    // Transition to post-payment flow
    setIsAfterPayment(true);
    member.setPhoneNumber("");
    member.setNumpadCountdown(NUMPAD_COUNTDOWN_SECONDS);
    heating.beginHeatingTimelineOnly(flatQueue);
    setActiveModal("numpad");
  };

  // ----- MODAL OPEN HANDLERS -----
  const handleOpenNumpad = () => {
    setIsAfterPayment(false);
    member.handleOpenNumpad();
    setActiveModal("numpad");
  };

  const handleCheckout = () => {
    if (!isAgentOnline || isMachineBusy) return;
    heating.heatingTimelineStartedRef.current = false;
    payment.handleCheckout();
  };

  const handleAddToCartGuarded = (product: Parameters<typeof handleAddToCart>[0]) => {
    if (isMachineBusy) return;
    handleAddToCart(product);
  };

  const showOrderBlocker = isMachineBusy && !isPostPaymentFlow;
  const showSystemBlocker = !showOrderBlocker && !isAgentOnline && !isPostPaymentFlow;

  const gateVariant = showOrderBlocker
    ? "order_busy"
    : !isConnected
      ? "internet"
      : "hardware";

  const showGateOverlay = showOrderBlocker || showSystemBlocker;

  // ----- RENDER -----
  return (
    <div className="vending-app">
      <Script
        src="https://cdn.omise.co/omise.js"
        onLoad={() => payment.setIsOmiseLoaded(true)}
      />

      {/* --- ฝั่งซ้าย: โซนเลือกสินค้า --- */}
      <div className="main-content">
        <div className="header">
          <span>
            M
            <Image
              src="/Logo_modpao.png"
              alt="Logo ModPao"
              width={70}
              height={70}
              className="logo-image"
              priority
            />
            D.PAO
          </span>
        </div>

        <div className="product-container">
          {isLoadingProducts ? (
            <div className="loading-state">กำลังโหลดสินค้า...</div>
          ) : products.length > 0 ? (
            products.map((product) => {
              const inCartQty = cart.find((c) => c.id === product.id)?.qty ?? 0;
              const canAdd = product.stock > 0 && inCartQty < product.stock;
              return (
                <ProductCard
                  key={product.id}
                  {...product}
                  canAdd={canAdd && !isMachineBusy}
                  onAdd={() => handleAddToCartGuarded(product)}
                />
              );
            })
          ) : (
            <div className="error-state">ไม่พบสินค้าที่พร้อมจำหน่าย</div>
          )}
        </div>

        <div className="device-id">
          <div
            className={`status-dot${showGateOverlay ? " status-dot-warning" : ""}`}
          />
          ID:{machineCode}
        </div>
      </div>

      {/* --- ฝั่งขวา: ตะกร้าสินค้า --- */}
      <CartSidebar
        cart={cart}
        stockById={stockById}
        totalHeatingTime={totalHeatingTime}
        totalPrice={totalPrice}
        payableTotal={payableTotal}
        appliedCoupon={appliedCoupon}
        onCheckout={handleCheckout}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onRemove={handleRemove}
        onOpenInfo={() => setActiveModal("info")}
        onOpenContact={() => setActiveModal("contact")}
        onOpenCoupon={() => setActiveModal("coupon")}
        onRemoveCoupon={() => setAppliedCoupon(null)}
      />

       {/* --- OVERLAY & MODALS --- */}
       {activeModal !== "none" && (
         <div
           className="modal-overlay"
           onClick={
             activeModal === "payment"
               ? () => {
                 if (payment.paymentStep === 1) {
                   payment.cancelAndClosePaymentModal();
                 }
               }
               : (activeModal === "numpad" || activeModal === "points_result" || activeModal === "processing")
                 ? undefined // ห้ามคลิกพื้นหลังสีดำเพื่อกดออกเด็ดขาด ป้องกัน Flow ชำระเงิน/อุ่นอาหารล่ม
                 : () => setActiveModal("none")
           }
         >
          {activeModal === "coupon" && (
            <CouponModal
              open
              onClose={() => setActiveModal("none")}
              onApplied={setAppliedCoupon}
              machineCode={machineCode}
              cart={cart.map((item) => ({ product_id: item.id, quantity: item.qty }))}
            />
          )}

          {activeModal === "info" && (
            <InfoModal
              onClose={() => setActiveModal("none")}
              onOpenUsage={() => setActiveModal("usage")}
              onOpenNumpad={handleOpenNumpad}
              onOpenContact={() => setActiveModal("contact")}
            />
          )}

          {activeModal === "usage" && (
            <UsageModal onClose={() => setActiveModal("none")} />
          )}

          {activeModal === "numpad" && (
            <NumpadModal
              isAfterPayment={isAfterPayment}
              phoneNumber={member.phoneNumber}
              numpadCountdown={member.numpadCountdown}
              isMemberLoading={member.isMemberLoading}
              formattedPhone={member.formattedPhone}
              onClose={() => setActiveModal("none")}
              onStartHeating={heating.startHeatingProcess}
              onNumberClick={member.handleNumberClick}
              onDeleteClick={member.handleDeleteClick}
              onConfirmPhone={member.handleConfirmPhone}
            />
          )}

          {activeModal === "points_result" && (
            <PointsResultModal
              isAfterPayment={isAfterPayment}
              memberError={member.memberError}
              isNewMember={member.isNewMember}
              earnedPoints={member.earnedPoints}
              memberPoints={member.memberPoints}
              pointsCountdown={member.pointsCountdown}
              onClose={() => setActiveModal("none")}
              onStartHeating={heating.startHeatingProcess}
            />
          )}

          {activeModal === "contact" && (
            <ContactModal onClose={() => setActiveModal("none")} />
          )}

          {activeModal === "limit_warning" && (
            <LimitWarningModal
              type="cart_full"
              onClose={() => setActiveModal("none")}
            />
          )}

          {activeModal === "stock_limit_warning" && (
            <LimitWarningModal
              type="stock_limit"
              message={stockLimitMessage}
              onClose={() => setActiveModal("none")}
            />
          )}

          {activeModal === "payment" && (
            <PaymentModal
              selectedPaymentMethod={payment.selectedPaymentMethod}
              paymentStep={payment.paymentStep}
              paymentCountdown={payment.paymentCountdown}
              isOmiseLoaded={payment.isOmiseLoaded}
              realQrCode={payment.realQrCode}
              isProcessingPayment={payment.isProcessingPayment}
              isNfcBlocked={payment.isNfcBlocked}
              isCancelPaymentConfirmOpen={payment.isCancelPaymentConfirmOpen}
              paymentErrorMsg={payment.paymentErrorMsg}
              onAttemptClose={payment.attemptClosePaymentModal}
              onSelectMethod={payment.setSelectedPaymentMethod}
              onDirectPromptPay={payment.handleDirectPromptPay}
              onDirectTrueMoney={payment.handleDirectTrueMoney}
              onProceedToTap={payment.handleProceedToTap}
              onSimulateNfcTap={payment.handleSimulateNfcTap}
              onSimulatePromptPaySuccess={payment.simulatePromptPaySuccess}
              onDismissCancelConfirm={payment.dismissCancelPaymentConfirm}
              onConfirmCancel={payment.confirmCancelPayment}
              onChangeMethod={() => payment.setSelectedPaymentMethod(null)}
              setPaymentCountdown={payment.setPaymentCountdown}
            />
          )}

          {activeModal === "processing" && (
            <ProcessingModal
              queue={heating.queue}
              currentStep={heating.currentStep}
              currentItemIndex={heating.currentItemIndex}
              isDispensingItem={heating.isDispensingItem}
              globalTimeLeft={heating.globalTimeLeft}
              isProcessCompleted={heating.isProcessCompleted}
              isProcessSuccess={heating.isProcessSuccess}
              isMultiFlavor={heating.isMultiFlavor}
              hasStartedServing={heating.hasStartedServing}
              progressLineWidth={heating.progressLineWidth}
              activeJobId={payment.currentChargeId}
              isConnected={isConnected}
              isAgentOnline={isAgentOnline}
              hasHardwareTelemetry={agentJobState !== null}
              processingStatusMessage={heating.processingStatusMessage}
              onComplete={heating.handleProcessingCompleteClose}
            />
          )}
        </div>
      )}

      <HardwareGateOverlay visible={showGateOverlay} variant={gateVariant} />
    </div>
  );
}
