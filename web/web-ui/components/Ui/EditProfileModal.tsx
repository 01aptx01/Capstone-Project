// components/ui/EditProfileModal.tsx
import React, { useState, useRef } from "react";

interface EditProfileModalProps {
  initialName: string;
  phone: string;
  initialAvatar: string;
  onClose: () => void;
  // เพิ่มการส่ง File กลับไปเผื่อนำไปยิง API อัปโหลด
  onSave: (newName: string, newAvatar: string, file: File | null) => void;
}

export function EditProfileModal({ initialName, phone, initialAvatar, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar); // เก็บ URL หรือ Placeholder
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // เก็บไฟล์จริงๆ เผื่อส่ง API

  // ตัวอ้างอิงไปยัง input file ที่ถูกซ่อนไว้
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ฟังก์ชันเมื่อผู้ใช้เลือกไฟล์รูป
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // สร้าง URL ชั่วคราวเพื่อแสดงพรีวิวให้ผู้ใช้เห็นทันที
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-5 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center justify-center p-6 border-b border-gray-100 relative">
          <h3 className="text-xl font-bold text-gray-800">แก้ไขข้อมูลโปรไฟล์</h3>
          <button 
            onClick={onClose}
            className="absolute right-4 p-2 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-full transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* ส่วนรูปโปรไฟล์ */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {/* Avatar Display */}
              <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-[#FFD1A6] flex items-center justify-center text-5xl shadow-inner overflow-hidden">
                {/* เช็คว่าถ้าเป็น blob (รูปที่อัปโหลด) หรือ url รูป ให้ใช้แท็ก img */}
                {avatar.startsWith("blob:") || avatar.startsWith("http") || avatar.startsWith("/") ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  avatar // ถ้ายังเป็น Emoji ก็แสดงแบบปกติ
                )}
              </div>
              
              {/* ปุ่มกล้องที่ใช้สั่งคลิก input file */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#FF8A33] text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-orange-600 transition-colors active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>

              {/* Input File (ซ่อนไว้) */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 font-medium">แตะไอคอนกล้องเพื่ออัปโหลดรูปภาพใหม่</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">ชื่อผู้ใช้งาน</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้งาน"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-[#FF8A33] transition-all text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                เบอร์โทรศัพท์ <span className="text-red-400 font-normal text-xs">(ไม่สามารถแก้ไขได้)</span>
              </label>
              <input 
                type="text" 
                value={phone}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-transparent bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            >
              ยกเลิก
            </button>
            <button 
              onClick={() => onSave(name, avatar, selectedFile)}
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#FF8A33] hover:bg-orange-600 transition-colors shadow-md text-sm"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}