"use client";

import { useState, useRef } from "react";
import { Button, Input, ModalSheet } from "@/components/Ui";

interface EditProfileModalProps {
  initialName: string;
  phone: string;
  initialAvatar: string;
  onClose: () => void;
  onSave: (newName: string, newAvatar: string, file: File | null) => void;
}

export function EditProfileModal({
  initialName,
  phone,
  initialAvatar,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <ModalSheet open onClose={onClose} title="แก้ไขข้อมูลโปรไฟล์">
      <div className="px-6 pb-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-border bg-brand-muted flex items-center justify-center text-5xl shadow-inner overflow-hidden">
              {avatar.startsWith("blob:") ||
              avatar.startsWith("http") ||
              avatar.startsWith("/") ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                avatar
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center border-2 border-surface shadow-md hover:bg-brand-hover transition-colors active:scale-95 touch-target"
              aria-label="อัปโหลดรูป"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-muted mt-3 font-medium">
            แตะไอคอนกล้องเพื่ออัปโหลดรูปภาพใหม่
          </p>
        </div>

        <div className="space-y-5">
          <Input
            label="ชื่อผู้ใช้งาน"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="กรอกชื่อผู้ใช้งาน"
            className="text-base py-3"
          />
          <Input
            label="เบอร์โทรศัพท์ (ไม่สามารถแก้ไขได้)"
            value={phone}
            disabled
            className="text-base py-3 bg-background cursor-not-allowed"
          />
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="secondary" fullWidth onClick={onClose}>
            ยกเลิก
          </Button>
          <Button fullWidth onClick={() => onSave(name, avatar, selectedFile)}>
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
