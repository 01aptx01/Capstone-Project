// app/(main)/profile/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EditProfileModal } from "@/components/Ui/EditProfileModal"; 

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "มดเปา", 
    phone: "066-879-1011",
    points: 150,
    avatar: "👧" 
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 💡 ตัวแปรจำลองจำนวนคูปอง (ถ้าเชื่อมระบบจริงให้ดึงจาก State/Context ได้เลย)
  const availableCoupons = 2;

  const profileMenus = [
    { id: "coupons", label: "คูปองของฉัน", href: "/coupons", icon: <div className="text-[#FF8A33]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5V3H9v2M15 21v-2H9v2M5 9a2 2 0 0 0 2-2V5h10v2a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2v2H7v-2a2 2 0 0 0-2-2V9z"/><line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" /></svg></div> },
    { id: "history", label: "ประวัติการสั่งซื้อทั้งหมด", href: "/history", icon: <div className="text-[#FF8A33]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div> },
    { id: "help", label: "ศูนย์ความช่วยเหลือ", href: "#", icon: <div className="text-[#FF8A33]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div> },
  ];

  const handleSaveProfile = (newName: string, newAvatar: string, file: File | null) => {
    setUser({ ...user, name: newName, avatar: newAvatar });
    setIsEditModalOpen(false);
  };

  const renderAvatar = (avatarData: string) => {
    if (avatarData.startsWith("blob:") || avatarData.startsWith("http") || avatarData.startsWith("/")) {
      return <img src={avatarData} alt={user.name} className="w-full h-full object-cover" />;
    }
    return <span className="text-5xl">{avatarData}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-6 md:pt-8 max-w-4xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-6 md:mb-8">
          <div className="h-28 md:h-36 bg-[#FF8A33]"></div>

          <div className="px-6 md:px-10 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 -mt-14 md:-mt-16 relative">
              
              {/* Avatar Display */}
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] border-4 border-white bg-gray-200 overflow-hidden shrink-0 mx-auto md:mx-0 shadow-sm relative">
                <div className="w-full h-full bg-[#FFD1A6] flex items-center justify-center">
                  {renderAvatar(user.avatar)}
                </div>
              </div>

              {/* ข้อมูล & ปุ่ม */}
              <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end md:pb-2 gap-4 md:gap-0">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-gray-500 mt-1">{user.phone}</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                  <div className="flex flex-col items-center md:items-end">
                    <span className="text-[10px] text-gray-400 font-bold mb-0.5 hidden md:block tracking-wide">คะแนนสะสม</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-3xl font-extrabold text-[#FF8A33]">{user.points}</span>
                      <span className="text-sm font-bold text-[#FF8A33] uppercase">PTS</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full md:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-colors text-sm"
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col divide-y divide-gray-50">
            {profileMenus.map((menu) => (
              <Link key={menu.id} href={menu.href} className="flex items-center justify-between p-6 hover:bg-orange-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    {menu.icon}
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-[#FF8A33] transition-colors">{menu.label}</span>
                </div>
                
                {/* 🚨 ส่วนที่แก้ไข: ฝั่งขวามี Badge และลูกศร */}
                <div className="flex items-center gap-3">
                  
                  {/* แสดง Badge ถ้าเป็นเมนูคูปอง และมีจำนวนมากกว่า 0 */}
                  {menu.id === "coupons" && availableCoupons > 0 && (
                    <span className="bg-[#FF8A33] text-white text-[13px] md:text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                      {availableCoupons} พร้อมใช้
                    </span>
                  )}

                  <div className="text-gray-300 group-hover:text-[#FF8A33] transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        </div>

        {/* ปุ่มออกจากระบบ */}
        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 text-[#FF5A5A] font-bold py-3 px-6 hover:bg-red-50 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            ออกจากระบบ
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          initialName={user.name}
          phone={user.phone}
          initialAvatar={user.avatar} 
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}