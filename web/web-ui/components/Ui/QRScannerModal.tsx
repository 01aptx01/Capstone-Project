// components/Ui/QRScannerModal.tsx
"use client";

import React, { useState } from "react";

interface QRScannerModalProps {
  orderNumber: string;
  onClose: () => void;
}

export function QRScannerModal({ orderNumber, onClose }: QRScannerModalProps) {
  // สร้าง State ควบคุมหน้าจอ: "idle" = สแกน, "success" = สำเร็จ, "failed" = สินค้าหมด
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "failed">("idle");

  return (
    <>
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanline {
          animation: scanline 2.5s infinite linear;
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-[340px] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()} 
        >
          {/* ปุ่ม X ปิดมุมขวาบน (ลอยอยู่เหนือทุกสิ่ง) */}
          <button 
            onClick={onClose}
            className={`absolute top-4 right-4 transition-colors z-30 p-2 ${scanStatus === 'idle' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* 🔴 สถานะ: กำลังสแกน (หน้าจอเดิม) */}
          {scanStatus === "idle" && (
            <div className="bg-[#161D29] flex flex-col w-full h-full animate-pop-in">
              <div className="h-[280px] flex items-center justify-center relative">
                <div className="w-56 h-56 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#FF8A33] rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#FF8A33] rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#FF8A33] rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#FF8A33] rounded-br-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 opacity-40">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                      <circle cx="6.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/><circle cx="6.5" cy="17.5" r="1.5"/>
                    </svg>
                  </div>
                  <div className="absolute left-1 right-1 h-[3px] bg-[#FF8A33] shadow-[0_0_15px_3px_rgba(255,138,51,0.6)] animate-scanline z-10 rounded-full" />
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-7 text-center shadow-[0_-10px_20px_rgba(0,0,0,0.1)] relative z-20 mt-auto">
                <h3 className="text-xl font-extrabold text-[#161D29] mb-2 tracking-tight">สแกน QR Code</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  นำกล้องจ่อที่หน้าจอของตู้ MOD PAO<br/>เพื่อรับออเดอร์ <span className="font-bold text-[#FF8A33]">#{orderNumber}</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setScanStatus("success")} className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm">
                    จำลองสำเร็จ
                  </button>
                  <button onClick={() => setScanStatus("failed")} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm border border-gray-200">
                    จำลองของหมด
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 🟢 สถานะ: สำเร็จ */}
          {scanStatus === "success" && (
            <div className="bg-white w-full h-full p-8 pt-10 pb-8 text-center flex flex-col items-center animate-pop-in">
              <div className="w-24 h-24 bg-emerald-50 text-[#10B981] rounded-full flex items-center justify-center mb-6 shadow-inner">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-[popIn_0.5s_ease-out_forwards]"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-800 mb-3">สแกนสำเร็จ!</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
                ตู้อบกำลังเริ่มอุ่นซาลาเปาให้คุณ กรุณารอสักครู่<br/>และรอรับสินค้าที่ช่องรับด้านล่าง<br/><span className="text-[#FF8A33] font-bold mt-2 inline-block">ขอให้อร่อยกับ MOD PAO นะครับ 🥟</span>
              </p>
              <button onClick={onClose} className="w-full bg-[#10B981] hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-base transition-colors shadow-[0_8px_20px_rgba(16,185,129,0.3)] mt-auto active:scale-95">
                ตกลง
              </button>
            </div>
          )}

          {/* 🔴 สถานะ: ไม่สำเร็จ (สินค้าหมด) */}
          {scanStatus === "failed" && (
            <div className="bg-white w-full h-full p-8 pt-10 pb-8 text-center flex flex-col items-center animate-pop-in">
              
              {/* 🚨 ใส่รูปโลโก้มดเปาเศร้า (เปลี่ยนชื่อไฟล์ src ให้ตรงกับที่คุณมีได้เลยครับ) */}
              <div className="w-28 h-28 mb-5 relative flex items-center justify-center">
                <img 
                  src="/sad-modpao.svg" // เปลี่ยนเป็นชื่อไฟล์จริงของคุณ เช่น /sad-logo.png
                  alt="Sad Mod Pao" 
                  className="w-full h-full object-contain drop-shadow-sm"
                  onError={(e) => {
                    // รูปสำรองกรณีหาไฟล์ไม่เจอ (หน้าบึ้งสีเทา)
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23A0AABF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
                  }}
                />
              </div>

              <h3 className="text-2xl font-extrabold text-gray-800 mb-3">ขออภัย สินค้าหมด</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed px-1">
                สินค้าที่คุณสั่งไว้หมดชั่วคราวในตู้นี้<br/>
                กรุณารอพนักงานมาเติม หรือลองสแกนที่ตู้อื่น<br/>
                <span className="text-xs text-gray-400 mt-2 block">(หากพบปัญหา สามารถแจ้งระบบได้ที่เมนูช่วยเหลือ)</span>
              </p>
              <button onClick={onClose} className="w-full bg-[#FF8A33] hover:bg-orange-500 text-white py-4 rounded-xl font-bold text-base transition-colors shadow-[0_8px_20px_rgba(255,138,51,0.3)] mt-auto active:scale-95">
                ตกลง
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}