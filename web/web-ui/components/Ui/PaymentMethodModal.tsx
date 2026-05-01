// components/Ui/PaymentMethodModal.tsx
"use client";

import React, { useState } from "react";

interface PaymentMethodModalProps {
  onClose: () => void;
  onConfirm: (method: string) => void;
}

export function PaymentMethodModal({ onClose, onConfirm }: PaymentMethodModalProps) {
  // ค่าเริ่มต้นตั้งให้เลือกพร้อมเพย์
  const [selectedMethod, setSelectedMethod] = useState<string>("promptpay");

  return (
    <div className="fixed inset-0 bg-black/50 z-[120] flex items-end md:items-center justify-center p-0 md:p-5 backdrop-blur-sm animate-fade-in">
      {/* กล่องเนื้อหา (มือถือจะสไลด์ขึ้นจากข้างล่าง คอมจะเด้งตรงกลาง) */}
      <div className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden flex flex-col animate-slide-up md:animate-scale-in">
        
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-800">เลือกช่องทางชำระเงิน</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* ตัวเลือกช่องทาง */}
        <div className="p-5 flex flex-col gap-3">
           
           {/* 1. ตัวเลือก พร้อมเพย์ */}
           <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === 'promptpay' ? 'border-[#FF8A33] bg-orange-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="w-12 h-12 bg-[#003D6A] rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                PP
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">พร้อมเพย์ (PromptPay)</h4>
                <p className="text-xs text-gray-500 mt-0.5">สแกนจ่ายผ่านแอปธนาคาร</p>
              </div>
              {/* Radio จำลอง */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMethod === 'promptpay' ? 'border-[#FF8A33]' : 'border-gray-300'}`}>
                {selectedMethod === 'promptpay' && <div className="w-2.5 h-2.5 bg-[#FF8A33] rounded-full animate-fade-in"></div>}
              </div>
              <input type="radio" className="hidden" checked={selectedMethod === 'promptpay'} onChange={() => setSelectedMethod('promptpay')} />
           </label>

           {/* 2. ตัวเลือก ทรูมันนี่ */}
           <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === 'truemoney' ? 'border-[#FF8A33] bg-orange-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="w-12 h-12 bg-[#FF8A33] rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                TM
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">ทรูมันนี่ (TrueMoney)</h4>
                <p className="text-xs text-gray-500 mt-0.5">สแกนจ่ายผ่านแอป TrueMoney</p>
              </div>
              {/* Radio จำลอง */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMethod === 'truemoney' ? 'border-[#FF8A33]' : 'border-gray-300'}`}>
                {selectedMethod === 'truemoney' && <div className="w-2.5 h-2.5 bg-[#FF8A33] rounded-full animate-fade-in"></div>}
              </div>
              <input type="radio" className="hidden" checked={selectedMethod === 'truemoney'} onChange={() => setSelectedMethod('truemoney')} />
           </label>

        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-gray-50 pb-8 md:pb-5">
          <button 
            onClick={() => onConfirm(selectedMethod)} 
            className="w-full py-3.5 bg-[#FF8A33] hover:bg-orange-500 text-white rounded-xl font-bold transition-colors shadow-md shadow-orange-500/20 text-lg"
          >
            ชำระเงิน
          </button>
        </div>

      </div>
    </div>
  );
}