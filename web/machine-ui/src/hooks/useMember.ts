"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ModalType } from "../types";
import { NUMPAD_COUNTDOWN_SECONDS, POINTS_COUNTDOWN_SECONDS, getPublicApiUrl } from "../constants";
import { displayFormattedPhone } from "../utils/phone";

interface UseMemberOptions {
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  isAfterPayment: boolean; // เป็นขั้นตอนสมัครสมาชิกหลังจ่ายเงินเสร็จหรือไม่
  currentChargeId: string | null; // รหัสบิลงานชำระเงินปัจจุบัน
  totalPriceRef: React.MutableRefObject<number>; // อ้างอิงยอดราคาสุทธิที่จ่ายไป (ใช้คำนวณแต้มสะสม)
  onStartHeating: () => void; // คำสั่งสำหรับเริ่มเดินเครื่องอุ่นอาหาร
}

// useMember Hook
// - จัดการระบบสมาชิกและสะสมคะแนน (Loyalty Points System)
// - รองรับการป้อนข้อมูลผ่านแป้นพิมพ์จำลอง (Numpad Modal)
// - ค้นหาข้อมูลสมาชิกเดิม
// - สะสมคะแนนหลังซื้อ
// - นับเวลาถอยหลังปิดหน้าจออัตโนมัติหากผู้ใช้ละทิ้งหน้าจอ
export function useMember({
  activeModal,
  setActiveModal,
  isAfterPayment,
  currentChargeId,
  totalPriceRef,
  onStartHeating,
}: UseMemberOptions) {
  // STATE
  const [phoneNumber, setPhoneNumber] = useState(""); // เบอร์โทรศัพท์ที่ลูกค้าป้อน (10 หลัก)
  const [memberPoints, setMemberPoints] = useState<number | null>(null); // คะแนนสะสมทั้งหมดของสมาชิก
  const [earnedPoints, setEarnedPoints] = useState<number>(0); // คะแนนที่เพิ่งได้รับจากออเดอร์นี้
  const [isNewMember, setIsNewMember] = useState<boolean>(false); // บ่งบอกว่าเป็นสมาชิกใหม่แกะกล่องที่เพิ่งสมัครหรือไม่
  const [isMemberLoading, setIsMemberLoading] = useState<boolean>(false); // แสดงสถานะกำลังเช็คข้อมูลสมาชิกกับ API
  const [memberError, setMemberError] = useState<string | null>(null); // ข้อผิดพลาดเกี่ยวกับระบบสมาชิก
  const [numpadError, setNumpadError] = useState<string | null>(null); // แจ้งเตือนบนหน้า numpad (แทน alert)
  const [numpadCountdown, setNumpadCountdown] = useState<number>(NUMPAD_COUNTDOWN_SECONDS); // เวลาถอยหลังหน้ากรอกเบอร์ (วิ)
  const [pointsCountdown, setPointsCountdown] = useState<number>(POINTS_COUNTDOWN_SECONDS); // เวลาถอยหลังหน้าผลลัพธ์คะแนน (วิ)

  const onStartHeatingRef = useRef(onStartHeating);
  onStartHeatingRef.current = onStartHeating;

  // TIMERS
  // ตัวนับถอยหลังหน้าจอแป้นพิมพ์ (Numpad)
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

  // ตัวนับถอยหลังแสดงแต้มผลลัพธ์ (Points Result Screen)
  useEffect(() => {
    if (activeModal !== "points_result") return;
    const timer = setInterval(() => {
      setPointsCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  // หากเวลาโชว์แต้มหมด
  useEffect(() => {
    if (activeModal === "points_result" && pointsCountdown === 0) {
      if (isAfterPayment) {
        onStartHeatingRef.current();
      } else {
        setActiveModal("none");
      }
    }
  }, [activeModal, pointsCountdown, isAfterPayment, setActiveModal]);

  // PHONE HANDLERS (ฟังก์ชันจัดการแป้นป้อนเบอร์โทร)
  // กดเลข 0-9
  const handleNumberClick = useCallback(
    (num: string) => {
      setNumpadError(null);
      if (phoneNumber.length < 10) setPhoneNumber((prev) => prev + num);
    },
    [phoneNumber.length],
  );

  // กดลบตัวเลขหลังสุด (Backspace)
  const handleDeleteClick = useCallback(() => {
    setNumpadError(null);
    setPhoneNumber((prev) => prev.slice(0, -1));
  }, []);

  // กดยืนยันเบอร์โทรศัพท์
  const handleConfirmPhone = useCallback(async () => {
    if (phoneNumber.length !== 10) {
      setNumpadError("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }

    const apiUrl = getPublicApiUrl();
    setIsMemberLoading(true);
    setMemberError(null);
    setNumpadError(null);

    if (isAfterPayment) {
      // กรณี: สะสมแต้ม (หลังจ่ายเงิน)
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
        
        // รับแต้มสะสมและอัปเดตข้อมูลขึ้นหน้าจอผลลัพธ์
        setEarnedPoints(data.points_earned ?? 0);
        setMemberPoints(data.total_points ?? 0);
        setIsNewMember(data.is_new_member ?? false);
        setPointsCountdown(POINTS_COUNTDOWN_SECONDS); // ตั้งเวลานับถอยหลังใหม่
        setActiveModal("points_result");
      } catch (err) {
        console.error("Earn points error:", err);
        setNumpadError(
          "ไม่สามารถสะสมแต้มได้ในขณะนี้ กรุณากด «ไม่สะสมแต้ม» เพื่อดำเนินการต่อ",
        );
      } finally {
        setIsMemberLoading(false);
      }
    } else {
      // กรณี: ดูคะแนนเฉยๆ
      try {
        const res = await fetch(`${apiUrl}/api/members/${phoneNumber}`);
        if (res.status === 404) {
          // หากไม่พบเบอร์ในฐานข้อมูล
          setMemberError("ไม่พบข้อมูลสมาชิก กรุณาลงทะเบียนหลังจากซื้อสินค้า");
          setMemberPoints(null);
          setEarnedPoints(0);
          setIsNewMember(false);
          setPointsCountdown(POINTS_COUNTDOWN_SECONDS);
          setActiveModal("points_result");
        } else if (res.ok) {
          // หากพบเบอร์โทร
          const data = await res.json();
          setMemberPoints(data.points);
          setEarnedPoints(0);
          setIsNewMember(false);
          setMemberError(null);
          setPointsCountdown(POINTS_COUNTDOWN_SECONDS);
          setActiveModal("points_result");
        } else {
          setNumpadError("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง");
        }
      } catch (err) {
        console.error("Lookup error:", err);
        setNumpadError("ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบเครือข่ายแล้วลองใหม่");
      } finally {
        setIsMemberLoading(false);
      }
    }
  }, [phoneNumber, isAfterPayment, currentChargeId, totalPriceRef, setActiveModal]);

  // จัดรูปแบบเบอร์โทรศัพท์ให้อ่านง่ายขึ้น
  const formattedPhone = displayFormattedPhone(phoneNumber);

  // ล้างสถานะเมื่อเปิดแป้นพิมพ์ขึ้นมาใหม่
  const handleOpenNumpad = useCallback(() => {
    setNumpadCountdown(NUMPAD_COUNTDOWN_SECONDS);
    setPhoneNumber("");
    setNumpadError(null);
  }, []);

  return {
    phoneNumber,
    setPhoneNumber,
    memberPoints, 
    earnedPoints, 
    isNewMember, 
    isMemberLoading, 
    memberError,
    numpadError,
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
