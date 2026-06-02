"use client";

import { useState } from "react";
import { Button, Input, ModalSheet } from "@/components/Ui";

interface EditProfileModalProps {
  initialName: string;
  phone: string;
  initialAvatar: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function EditProfileModal({
  initialName,
  phone,
  initialAvatar,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName);

  return (
    <ModalSheet open onClose={onClose} title="แก้ไขข้อมูลโปรไฟล์" titleAlign="center">
      <div className="px-6 pb-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-border bg-white flex items-center justify-center text-5xl shadow-inner overflow-hidden">
            {initialAvatar.startsWith("http") || initialAvatar.startsWith("/") ? (
              <img src={initialAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initialAvatar
            )}
          </div>
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
          <Button fullWidth onClick={() => onSave(name)}>
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
