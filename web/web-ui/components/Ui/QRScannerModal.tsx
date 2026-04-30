// components/ui/QRScannerModal.tsx
import React from "react";

interface QRScannerModalProps {
  orderNumber: string;
  onClose: () => void;
}

export function QRScannerModal({ orderNumber, onClose }: QRScannerModalProps) {
  return (
    <>
      {/* 1. CSS Animation สำหรับเส้นสแกนสีส้มวิ่งขึ้นลง */}
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
      `}</style>

      {/* 2. Overlay พื้นหลังโปร่งแสง */}
      <div 
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        {/* 3. กล่อง Modal หลัก */}
        <div 
          className="w-full max-w-[340px] bg-[#161D29] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()} // ป้องกันการกดทะลุไปปิด
        >
          {/* ปุ่ม X ปิดมุมขวาบน */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 p-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* ส่วนบน (สีเข้ม): พื้นที่สแกน QR */}
          <div className="h-[280px] flex items-center justify-center relative">
            {/* กรอบสแกน 4 มุม */}
            <div className="w-56 h-56 relative">
              {/* มุมซ้ายบน */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#FF8A33] rounded-tl-2xl" />
              {/* มุมขวาบน */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#FF8A33] rounded-tr-2xl" />
              {/* มุมซ้ายล่าง */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#FF8A33] rounded-bl-2xl" />
              {/* มุมขวาล่าง */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#FF8A33] rounded-br-2xl" />

              {/* ไอคอน QR ตรงกลาง (Placeholder) */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 opacity-40">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                  <circle cx="6.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/><circle cx="6.5" cy="17.5" r="1.5"/>
                </svg>
              </div>

              {/* ✨ เส้นเลเซอร์สีส้ม (Glow Effect) ✨ */}
              <div className="absolute left-1 right-1 h-[3px] bg-[#FF8A33] shadow-[0_0_15px_3px_rgba(255,138,51,0.6)] animate-scanline z-10 rounded-full" />
            </div>
          </div>

          {/* ส่วนล่าง (สีขาว): ข้อความอธิบายและปุ่มจำลอง */}
          <div className="bg-white rounded-[2rem] p-7 text-center shadow-[0_-10px_20px_rgba(0,0,0,0.1)] relative z-20">
            <h3 className="text-xl font-extrabold text-[#161D29] mb-2 tracking-tight">
              สแกน QR Code
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              นำกล้องจ่อที่หน้าจอของตู้ MOD PAO<br/>
              เพื่อรับออเดอร์ <span className="font-bold text-[#FF8A33]">#{orderNumber}</span>
            </p>

            <button 
              onClick={() => {
                alert(`จำลอง: สแกนออเดอร์ ${orderNumber} สำเร็จ!`);
                onClose();
              }}
              className="w-full bg-[#161D29] hover:bg-[#253043] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
              จำลองการสแกนสำเร็จ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}