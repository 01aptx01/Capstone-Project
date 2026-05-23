"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EditProfileModal } from "@/components/Ui/EditProfileModal";
import { useUser } from "@/context/UserContext";
import { updateMemberProfile } from "@/lib/api/members";
import { clearSession } from "@/lib/auth/session";

export default function ProfilePage() {
  const router = useRouter();
  const { phone, profile, displayName, setDisplayName, isLoading, logout, loadMember } =
    useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [avatar, setAvatar] = useState("👧");

  const points = profile?.points ?? 0;
  const formattedPhone = phone
    ? phone.length > 3
      ? `${phone.slice(0, 3)}-${phone.slice(3)}`
      : phone
    : "-";

  const profileMenus = [
    {
      id: "coupons",
      label: "คูปองของฉัน",
      href: "/coupons",
    },
    {
      id: "history",
      label: "ประวัติการสั่งซื้อทั้งหมด",
      href: "/history",
    },
    {
      id: "help",
      label: "ศูนย์ความช่วยเหลือ",
      href: "/help",
    },
  ];

  const handleSaveProfile = async (
    newName: string,
    newAvatar: string,
    _file: File | null,
  ) => {
    if (phone) {
      try {
        await updateMemberProfile(phone, newName);
        await loadMember();
      } catch {
        /* keep local name on API failure */
      }
    }
    setDisplayName(newName);
    setAvatar(newAvatar);
    setIsEditModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    clearSession();
    router.push("/login");
  };

  const renderAvatar = (avatarData: string) => {
    if (
      avatarData.startsWith("blob:") ||
      avatarData.startsWith("http") ||
      avatarData.startsWith("/")
    ) {
      return (
        <img
          src={avatarData}
          alt={displayName}
          className="w-full h-full object-cover"
        />
      );
    }
    return <span className="text-5xl">{avatarData}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-10">
      <div className="px-5 md:px-10 pt-6 md:pt-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center relative">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 text-sm font-bold text-[#FF8A33]"
          >
            แก้ไข
          </button>
          <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-50 flex items-center justify-center mb-4 border-4 border-orange-100">
            {renderAvatar(avatar)}
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">{displayName}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isLoading ? "กำลังโหลด..." : formattedPhone}
          </p>
          <div className="mt-4 bg-orange-50 px-6 py-3 rounded-2xl text-center">
            <p className="text-xs text-gray-500 font-bold">คะแนนสะสม</p>
            <p className="text-3xl font-extrabold text-[#FF8A33]">{points}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {profileMenus.map((menu) => (
            <Link
              key={menu.id}
              href={menu.href}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 font-bold text-gray-700 hover:bg-orange-50 transition-colors"
            >
              {menu.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-4 p-4 rounded-2xl border border-red-100 text-red-500 font-bold hover:bg-red-50"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          initialName={displayName}
          initialAvatar={avatar}
          phone={phone ?? ""}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
