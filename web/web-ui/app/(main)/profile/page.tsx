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
    { id: "coupons", label: "คูปองของฉัน", href: "/coupons" },
    { id: "history", label: "ประวัติการสั่งซื้อทั้งหมด", href: "/history" },
    { id: "help", label: "ศูนย์ความช่วยเหลือ", href: "/help" },
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
        <Card padding="none" className="relative overflow-visible">
          {/* Branded header */}
          <div className="h-28 rounded-t-card bg-linear-to-br from-brand to-brand-hover">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="แก้ไขโปรไฟล์"
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          {/* Avatar — absolute to Card, straddles header/body boundary */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-surface shadow-lg">
              {renderAvatar(avatar)}
            </div>
          </div>

          {/* Name + phone — pt-14 clears the avatar overhang */}
          <div className="flex flex-col items-center px-6 pt-14 pb-5 text-center bg-surface rounded-b-card border border-t-0 border-border">
            <h2 className="font-display text-xl font-bold text-foreground leading-tight">
              {displayName}
            </h2>
            <p className="text-muted text-sm mt-1">
              {isLoading ? "กำลังโหลด..." : formattedPhone}
            </p>

            {/* Points strip */}
            <div className="mt-5 w-full flex items-center justify-between rounded-2xl bg-linear-to-r from-brand/10 to-brand-muted px-5 py-3 border border-brand/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">คะแนนสะสม</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-brand">{points}</span>
                <span className="text-xs font-extrabold text-brand/60 uppercase">แต้ม</span>
              </div>
            </div>
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
