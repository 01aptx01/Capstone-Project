"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EditProfileModal } from "@/components/Ui/EditProfileModal";
import { useUser } from "@/context/UserContext";
import { updateMemberProfile } from "@/lib/api/members";
import { clearSession } from "@/lib/auth/session";
import { Button, Card } from "@/components/Ui";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const {
    phone,
    profile,
    displayName,
    setDisplayName,
    isLoading,
    logout,
    loadMember,
  } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [avatar] = useState("/Guest.png");

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
      description: "ดูคูปองที่พร้อมใช้งาน",
      href: "/coupons",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 5V3H9v2M15 21v-2H9v2M5 9a2 2 0 0 0 2-2V5h10v2a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2v2H7v-2a2 2 0 0 0-2-2V9z" />
          <line x1="9" y1="12" x2="15" y2="12" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "ประวัติการสั่งซื้อทั้งหมด",
      description: "รายการย้อนหลัง",
      href: "/history",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "help",
      label: "ศูนย์ความช่วยเหลือ",
      description: "คำถามที่พบบ่อย · ติดต่อเรา",
      href: "/help",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  const handleSaveProfile = async (newName: string) => {
    if (phone) {
      try {
        await updateMemberProfile(phone, newName);
        await loadMember();
      } catch {
        /* keep local name on API failure */
      }
    }
    setDisplayName(newName);
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
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="page-container pt-6 md:pt-8 max-w-4xl">
        <Card className="flex flex-col items-center relative p-6 md:p-8">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 text-sm font-bold text-brand touch-target"
          >
            แก้ไข
          </button>
          <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-muted flex items-center justify-center mb-4 border-4 border-brand-muted">
            {renderAvatar(avatar)}
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {displayName}
          </h2>
          <p className="text-muted text-sm mt-1">
            {isLoading ? "กำลังโหลด..." : formattedPhone}
          </p>
          <div className="mt-4 bg-brand-muted px-6 py-3 rounded-2xl text-center w-full max-w-xs">
            <p className="text-xs text-muted font-bold">คะแนนสะสม</p>
            <p className="text-3xl font-extrabold text-brand">{points}</p>
          </div>
        </Card>

        <div className="mt-6 flex flex-col gap-2">
          {profileMenus.map((menu) => (
            <Link
              key={menu.id}
              href={menu.href}
              className={cn(
                "bg-surface px-4 py-3.5 rounded-card shadow-sm border border-border",
                "hover:bg-brand-muted/40 transition-colors flex items-center gap-4",
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                {menu.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-sm">{menu.label}</p>
                <p className="text-xs text-muted mt-0.5">{menu.description}</p>
              </div>
              <span className="text-muted text-lg shrink-0" aria-hidden>›</span>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="mt-2 text-red-600 font-bold hover:bg-red-50 border border-red-200 hover:border-red-300"
            fullWidth
            onClick={handleLogout}
          >
            ออกจากระบบ
          </Button>
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
