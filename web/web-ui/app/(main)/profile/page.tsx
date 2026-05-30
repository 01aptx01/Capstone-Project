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
  const [avatar, setAvatar] = useState("👧");

  const points = profile?.points ?? 0;
  const formattedPhone = phone
    ? phone.length > 3
      ? `${phone.slice(0, 3)}-${phone.slice(3)}`
      : phone
    : "-";

  const profileMenus = [
    { id: "coupons", label: "คูปองของฉัน", href: "/coupons" },
    { id: "history", label: "ประวัติการสั่งซื้อทั้งหมด", href: "/history" },
    { id: "help", label: "ศูนย์ความช่วยเหลือ", href: "/help" },
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
                "bg-surface p-4 rounded-card shadow-sm border border-border font-bold text-foreground",
                "hover:bg-brand-muted transition-colors touch-target flex items-center justify-between",
              )}
            >
              {menu.label}
              <span className="text-muted text-lg" aria-hidden>
                ›
              </span>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="mt-2 text-destructive hover:bg-red-50 border border-red-100"
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
