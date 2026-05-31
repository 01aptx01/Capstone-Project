"use client";

import { useState } from "react";
import { PageHeader, Card } from "@/components/Ui";
import { cn } from "@/lib/utils";

export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "ต้องการใช้คูปองส่วนลดต้องทำอย่างไร?",
      answer:
        "คุณสามารถสะสมคะแนนเพื่อแลกรับคูปองส่วนลดได้ที่หน้า 'แลกคูปอง' จากนั้นนำรหัสคูปองจากหน้า 'คูปองของฉัน' ไปกรอกรหัสที่ตู้ MOD PAO ในขณะทำรายการสั่งซื้อหน้าร้านเพื่อรับส่วนลดทันที",
    },
    {
      question: "คะแนนสะสม (Points) ได้มาจากไหน?",
      answer:
        "ทุกครั้งที่คุณสั่งซื้อสินค้าผ่านตู้ MOD PAO และล็อกอินด้วยหมายเลขโทรศัพท์ในแอปนี้ คะแนนสะสมจะถูกเพิ่มเข้าไปในบัญชีของคุณโดยอัตโนมัติ",
    },
    {
      question: "ต้องทำอย่างไรหากตู้ขัดข้อง?",
      answer:
        "หากพบปัญหาตู้ไม่จ่ายของหรือตู้ขัดข้องขณะทำรายการ กรุณาติดต่อทีมงานช่วยเหลือผ่าน LINE @modpao พร้อมแจ้งรหัสเครื่องและรายละเอียดเพื่อรับบริการดูแลและแก้ไขปัญหาคืนเงินหรือแต้มสะสมโดยทันที",
    },
    {
      question: "แต้มสะสมมีวันหมดอายุหรือไม่?",
      answer:
        "แต้มสะสม (Points) ของคุณไม่มีวันหมดอายุ สามารถเก็บบันทึกสะสมไว้เพื่อแลกรับโปรโมชันและส่วนลดพิเศษสำหรับตู้ซาลาเปาอัจฉริยะ MOD PAO ได้ตลอดเวลาครับ",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen pb-6">
      <div className="page-container pt-6 max-w-2xl">
        <PageHeader title="ศูนย์ความช่วยเหลือ" />

        <section className="mb-8">
          <h2 className="font-bold text-foreground text-lg mb-4">ติดต่อเรา</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center justify-center p-5 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl" aria-hidden>
                  💬
                </span>
              </div>
              <span className="font-bold text-sm text-foreground">แชทผ่าน LINE</span>
              <span className="text-[11px] text-muted mt-1">@modpao_support</span>
            </Card>

            <Card className="flex flex-col items-center justify-center p-5 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-sky-50 text-info rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl" aria-hidden>
                  📞
                </span>
              </div>
              <span className="font-bold text-sm text-foreground">โทรศัพท์</span>
              <span className="text-[11px] text-muted mt-1">02-123-4567</span>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-foreground text-lg mb-4">
            คำถามที่พบบ่อย (FAQ)
          </h2>

          <Card padding="none" className="overflow-hidden">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 hover:bg-background transition-colors text-left touch-target"
                  >
                    <span
                      className={cn(
                        "font-bold text-sm md:text-base pr-4 transition-colors",
                        isOpen ? "text-brand" : "text-foreground",
                      )}
                    >
                      {faq.question}
                    </span>
                    <svg
                      className={cn(
                        "shrink-0 transition-transform duration-300",
                        isOpen ? "text-brand rotate-180" : "text-muted",
                      )}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted animate-fade-in leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </section>
      </div>
    </div>
  );
}
