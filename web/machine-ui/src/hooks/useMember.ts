"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ModalType } from "../types";
import { NUMPAD_COUNTDOWN_SECONDS, POINTS_COUNTDOWN_SECONDS } from "../constants";
import { displayFormattedPhone } from "../utils/phone";

interface UseMemberOptions {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  isAfterPayment: boolean;
  currentChargeId: string | null;
  totalPriceRef: React.MutableRefObject<number>;
  onStartHeating: () => void;
}

export function useMember({
  activeModal,
  setActiveModal,
  isAfterPayment,
  currentChargeId,
  totalPriceRef,
  onStartHeating,
}: UseMemberOptions) {
  // ==========================================
  // STATE
  // ==========================================
  const [phoneNumber, setPhoneNumber] = useState("");
  const [memberPoints, setMemberPoints] = useState<number | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [isNewMember, setIsNewMember] = useState<boolean>(false);
  const [isMemberLoading, setIsMemberLoading] = useState<boolean>(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [numpadCountdown, setNumpadCountdown] = useState<number>(NUMPAD_COUNTDOWN_SECONDS);
  const [pointsCountdown, setPointsCountdown] = useState<number>(POINTS_COUNTDOWN_SECONDS);

  // Stable ref for callback
  const onStartHeatingRef = useRef(onStartHeating);
  onStartHeatingRef.current = onStartHeating;

  // ==========================================
  // TIMERS
  // ==========================================
  // Timer: นับถอยหลังหน้ารับเบอร์โทร (Numpad)
  useEffect(() => {
    if (activeModal !== "numpad") return;
    const timer = setInterval(() => {
      setNumpadCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === "numpad" && numpadCountdown === 0) {
      if (isAfterPayment) {
        onStartHeatingRef.current();
      } else {
        setActiveModal("none");
      }
    }
  }, [activeModal, numpadCountdown, isAfterPayment, setActiveModal]);

  // Timer: นับถอยหลังการโชว์คะแนนสะสม
  useEffect(() => {
    if (activeModal !== "points_result") return;
    const timer = setInterval(() => {
      setPointsCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  useEffect(() => {
    if (activeModal === "points_result" && pointsCountdown === 0) {
      if (isAfterPayment) {
        onStartHeatingRef.current();
      } else {
        setActiveModal("none");
      }
    }
  }, [activeModal, pointsCountdown, isAfterPayment, setActiveModal]);

  // ==========================================
  // PHONE HANDLERS
  // ==========================================
  const handleNumberClick = useCallback(
    (num: string) => {
      if (phoneNumber.length < 10) setPhoneNumber((prev) => prev + num);
    },
    [phoneNumber.length],
  );

  const handleDeleteClick = useCallback(() => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  }, []);

  const handleConfirmPhone = useCallback(async () => {
    if (phoneNumber.length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setIsMemberLoading(true);
    setMemberError(null);

    if (isAfterPayment) {
      try {
        const res = await fetch(`${apiUrl}/api/members/earn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: phoneNumber,
            total_price: totalPriceRef.current,
            charge_id: currentChargeId,
          }),
        });
        const data = await res.json();
        setEarnedPoints(data.points_earned ?? 0);
        setMemberPoints(data.total_points ?? 0);
        setIsNewMember(data.is_new_member ?? false);
        setPointsCountdown(POINTS_COUNTDOWN_SECONDS);
        setActiveModal("points_result");
      } catch (err) {
        console.error("Earn points error:", err);
        onStartHeatingRef.current();
      } finally {
        setIsMemberLoading(false);
      }
    } else {
      try {
        const res = await fetch(`${apiUrl}/api/members/${phoneNumber}`);
        if (res.status === 404) {
          setMemberError("ไม่พบข้อมูลสมาชิก กรุณาลงทะเบียนหลังจากซื้อสินค้า");
          setMemberPoints(null);
          setEarnedPoints(0);
          setIsNewMember(false);
          setPointsCountdown(POINTS_COUNTDOWN_SECONDS);
          setActiveModal("points_result");
        } else if (res.ok) {
          const data = await res.json();
          setMemberPoints(data.points);
          setEarnedPoints(0);
          setIsNewMember(false);
          setMemberError(null);
          setPointsCountdown(POINTS_COUNTDOWN_SECONDS);
          setActiveModal("points_result");
        } else {
          alert("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
        }
      } catch (err) {
        console.error("Lookup error:", err);
        alert("ไม่สามารถเชื่อมต่อกับระบบได้");
      } finally {
        setIsMemberLoading(false);
      }
    }
  }, [phoneNumber, isAfterPayment, currentChargeId, totalPriceRef, setActiveModal]);

  const formattedPhone = displayFormattedPhone(phoneNumber);

  /** Reset numpad state when opening for a fresh session */
  const handleOpenNumpad = useCallback(() => {
    setNumpadCountdown(NUMPAD_COUNTDOWN_SECONDS);
    setPhoneNumber("");
  }, []);

  return {
    phoneNumber,
    setPhoneNumber,
    memberPoints,
    earnedPoints,
    isNewMember,
    isMemberLoading,
    memberError,
    numpadCountdown,
    setNumpadCountdown,
    pointsCountdown,
    handleNumberClick,
    handleDeleteClick,
    handleConfirmPhone,
    formattedPhone,
    handleOpenNumpad,
  };
}
