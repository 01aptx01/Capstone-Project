// app/(main)/help/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HelpCenterPage() {
  const router = useRouter();
  
  // State สำหรับเก็บว่าตอนนี้เปิด FAQ ข้อไหนอยู่ (null = ปิดหมด)
  const [openIndex, setOpenIndex] = useState<number | null>(0); // ตั้งค่าเริ่มต้นให้เปิดข้อแรกไว้

  // 📝 ข้อมูล FAQ (คุณสามารถมาแก้ข้อความตรงนี้ได้เลย)
  const faqs = [
    {
      question: "จองซาลาเปาแล้วรับของยังไง?",
      answer: "นำ QR Code จากหน้าประวัติการจอง ไปสแกนที่ตู้ MOD PAO สาขาที่คุณเลือกไว้ ภายใน 24 ชั่วโมง เพื่อรับซาลาเปาร้อนๆ ได้ทันที"
    },
    {
      question: "คูปองส่วนลดใช้งานยังไง?",
      answer: "กดปุ่ม 'ใช้คูปอง' ในหน้าคูปองของฉัน ระบบจะจดจำและนำไปหักเป็นส่วนลดให้อัตโนมัติในตะกร้าคำสั่งซื้อถัดไปของคุณ หรือ คุณสามารถเลือกใช้คูปองส่วนลดได้ในหน้า 'ตะกร้าของฉัน' ก่อนทำการชำระเงิน โดยระบบจะคำนวณส่วนลดให้โดยอัตโนมัติ"
    },
    {
      question: "ต้องทำอย่างไรหากตู้ขัดข้อง?",
      answer: "หากพบปัญหาตู้ไม่จ่ายของหรือขัดข้อง กรุณาติดต่อแอดมินผ่าน LINE @modpao พร้อมแจ้งรหัสตู้ (เช่น MP-001) และหมายเลขคำสั่งซื้อ เพื่อดำเนินการช่วยเหลือหรือคืนเงินครับ"
    },
    {
      question: "แต้มสะสมมีวันหมดอายุไหม?",
      answer: "แต้มสะสม (Points) ไม่มีวันหมดอายุ คุณสามารถสะสมไว้เพื่อแลกของรางวัลหรือส่วนลดพิเศษต่างๆ ได้ตลอดการใช้งานแอปพลิเคชัน"
    }
  ];

  const toggleFaq = (index: number) => {
    // ถ้ากดข้อที่เปิดอยู่ ให้ปิด (เซ็ตเป็น null) ถ้ากดข้ออื่น ให้เปิดข้อนั้น
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 p-5 pt-6 max-w-2xl mx-auto w-full">
        <button onClick={() => router.back()} className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h1 className="text-xl font-extrabold text-[#161D29]">ศูนย์ความช่วยเหลือ</h1>
      </div>

      <div className="px-5 w-full max-w-2xl mx-auto flex flex-col gap-8">
        
        {/* Section 1: ติดต่อเรา */}
        <section>
          <h2 className="font-bold text-gray-800 text-lg mb-4">ติดต่อเรา</h2>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Card LINE */}
            <div className="bg-white rounded-[20px] p-5 flex flex-col items-center justify-center border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                {/* LINE Icon SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
              <span className="font-bold text-sm text-gray-800">แชทผ่าน LINE</span>
              <span className="text-[11px] text-gray-400 mt-1">@modpao_support</span>
            </div>

            {/* Card โทรศัพท์ */}
            <div className="bg-white rounded-[20px] p-5 flex flex-col items-center justify-center border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                {/* Phone Icon SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <span className="font-bold text-sm text-gray-800">โทรศัพท์</span>
              <span className="text-[11px] text-gray-400 mt-1">02-123-4567</span>
            </div>

          </div>
        </section>

        {/* Section 2: คำถามที่พบบ่อย (FAQ) */}
        <section>
          <h2 className="font-bold text-gray-800 text-lg mb-4">คำถามที่พบบ่อย (FAQ)</h2>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              
              return (
                <div key={index} className="border-b border-gray-50 last:border-0">
                  {/* หัวข้อคำถาม (กดได้) */}
                  <div 
                    onClick={() => toggleFaq(index)}
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
                  >
                    <span className={`font-bold text-sm md:text-base pr-4 transition-colors ${isOpen ? "text-[#FF8A33]" : "text-[#161D29]"}`}>
                      {faq.question}
                    </span>
                    <svg 
                      className={`shrink-0 transition-transform duration-300 ${isOpen ? "text-[#FF8A33] rotate-180" : "text-gray-400"}`} 
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {/* เนื้อหาคำตอบ (เปิด/ปิด) */}
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-gray-600 animate-fade-in leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}