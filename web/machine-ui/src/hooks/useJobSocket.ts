/**
 * useJobSocket
 * — React Hook ที่เชื่อมต่อระหว่าง MachineUI กับ Server ผ่าน Socket.IO
 *
 * หน้าที่ของ Hook:
 *  1. เชื่อมต่อไปยัง Server (SERVER_SOCKET_URL)
 *  2. เข้าร่วมห้องสื่อสารตามรหัสตู้นั้นๆ (machine_code)
 *  3. รอรับสัญญาณเหตุการณ์ `job.start` และ `job_event_broadcast` (สำหรับข้อมูลการประมวลผล)
 *  4. นำข้อมูลสถานะตู้จริง, ลำดับคิว, และเวลาคงเหลือ มาอัปเดต UI แบบเรียลไทม์
 */

"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { DEFAULT_MACHINE_CODE, getKioskSocketSecret, getPublicSocketUrl } from "../constants";

export type AgentJobState =
  | "TRANSFER_TO_OVEN" // กำลังย้ายของเข้าเตาอุ่น
  | "HEATING"          // กำลังอุ่นร้อนด้วยเตาไมโครเวฟ
  | "DISPENSING"       // กำลังลำเลียงเสิร์ฟทางช่องรับสินค้า
  | "DONE"             // เสร็จสิ้นกระบวนการทั้งหมด
  | "ERROR";           // เกิดข้อผิดพลาดของระบบแมคคานิกส์ตู้

export interface JobSocketState {
  agentJobState: AgentJobState | null; // สถานะปัจจุบันของตู้
  agentCurrentItemIndex: number; // ชิ้นที่กำลังทำอยู่ (เริ่มที่ 0)
  globalTimeLeft: number; // วินาทีคงเหลือจริงที่ส่งจากเซ็นเซอร์เครื่อง
  isConnected: boolean; // สถานะการต่อเชื่อมของ Socket.IO (kiosk ↔ server)
  isAgentOnline: boolean; // Pi hardware agent ใน room เดียวกัน (machine_presence)
}

export interface UseJobSocketOptions {
  activeJobId: string | null; // รหัสบิลชำระเงินที่ต้องการดู (เริ่มดึง socket เมื่อค่านี้ไม่เป็น null)
  onConnect?: () => void; // ฟังก์ชันเสริมที่จะรันเมื่อเชื่อมต่อเชื่อมสำเร็จ
}

export function useJobSocket({
  activeJobId,
  onConnect,
}: UseJobSocketOptions): JobSocketState {
  const serverUrl = getPublicSocketUrl();
  const machineCode = DEFAULT_MACHINE_CODE;
  const kioskSecret = getKioskSocketSecret();

  const socketRef = useRef<Socket | null>(null);

  // --- STATES ---
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentOnline, setIsAgentOnline] = useState(false);
  const [agentJobState, setAgentJobState] = useState<AgentJobState | null>(null);
  const [agentCurrentItemIndex, setAgentCurrentItemIndex] = useState(0);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(0);

  // ฟังก์ชันรีเซ็ตค่าสถานะเมื่อเริ่มงานใหม่
  const resetJobState = useCallback(() => {
    setAgentJobState(null);
    setAgentCurrentItemIndex(0);
    setGlobalTimeLeft(0);
  }, []);

  useEffect(() => {
    if (!kioskSecret) {
      console.error(
        "[useJobSocket] NEXT_PUBLIC_KIOSK_SOCKET_SECRET is required (must match server KIOSK_SOCKET_SECRET)",
      );
      return;
    }

    // สร้างตัวแปร Singleton สำหรับ Socket.IO ถ้ายังไม่เคยมี
    if (!socketRef.current) {
      socketRef.current = io(serverUrl, {
        transports: ["websocket"], // บังคับการส่งแบบ WebSocket เพื่อความเร็วและความสม่ำเสมอ
        auth: {
          role: "kiosk",
          machine_code: machineCode,
          kiosk_secret: kioskSecret,
        },
        reconnection: true, // เปิดระบบเชื่อมต่อใหม่อัตโนมัติเมื่อหลุด
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
      });
    }

    const socket = socketRef.current;

    // เกิดขึ้นเมื่อต่อ Server สำเร็จ -> แจ้ง Server ว่าตู้พร้อมทำงาน และเข้าร่วมห้องตามรหัสตู้
    const onConnectEvt = () => {
      setIsConnected(true);
      onConnect?.();
    };

    const onDisconnect = () => setIsConnected(false);

    const onMachinePresence = (data: { machine_code?: string; online?: boolean }) => {
      if (data?.machine_code && data.machine_code !== machineCode) return;
      setIsAgentOnline(Boolean(data?.online));
    };

    // สัญญาณ 'job.start': ได้รับเมื่อ Server สั่งเริ่มงานส่งไปที่ตู้
    const onJobStart = (data: { job_id?: string;[key: string]: unknown }) => {
      if (activeJobId && data?.job_id !== activeJobId) return; // กรองเฉพาะบิลของเรา
      resetJobState();
    };

    // สัญญาณ 'job_event_broadcast': Server จะทำการกระจายข้อมูลอัปเดตสดๆ
    const onJobEventBroadcast = (data: {
      job_id?: string;
      state?: AgentJobState;
      event_type?: string;
      seq?: number;
      payload?: {
        remaining_seconds?: number;
        current_item_index?: number;
      };
    }) => {
      if (!activeJobId || data?.job_id !== activeJobId) return;

      const state = data?.state as AgentJobState | undefined;
      if (state) setAgentJobState(state);

      const payload = data?.payload || {};
      if (typeof payload.remaining_seconds === "number") {
        setGlobalTimeLeft(payload.remaining_seconds);
      }
      if (typeof payload.current_item_index === "number") {
        setAgentCurrentItemIndex(payload.current_item_index);
      }
    };

    // สมัครรับข้อมูลจาก event ต่างๆ
    socket.on("connect", onConnectEvt);
    socket.on("disconnect", onDisconnect);
    socket.on("job.start", onJobStart);
    socket.on("job_event_broadcast", onJobEventBroadcast);
    socket.on("machine_presence", onMachinePresence);

    // เช็คกรณีถ้า socket มีการเชื่อมต่อค้างไว้อยู่แล้ว ให้เซ็ตเป็นเชื่อมต่อทันที
    if (socket.connected) {
      setIsConnected(true);
    }

    // Cleanup: เคลียร์ Listener ออกเมื่อเลิกใช้ Hook หรือ Component ถูกปลดออก
    return () => {
      socket.off("connect", onConnectEvt);
      socket.off("disconnect", onDisconnect);
      socket.off("job.start", onJobStart);
      socket.off("job_event_broadcast", onJobEventBroadcast);
      socket.off("machine_presence", onMachinePresence);
    };
  }, [serverUrl, machineCode, kioskSecret, activeJobId, onConnect, resetJobState]);

  // รีเซ็ตสถานะการแสดงผลเมื่อเคลียร์หรือไม่มีบิลงานที่ต้องดูแล้ว
  useEffect(() => {
    if (!activeJobId) resetJobState();
  }, [activeJobId, resetJobState]);

  return {
    agentJobState,
    agentCurrentItemIndex,
    globalTimeLeft,
    isConnected,
    isAgentOnline,
  };
}
