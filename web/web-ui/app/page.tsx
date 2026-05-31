// app/page.tsx
// ─── ROOT REDIRECT PAGE ──────────────────────────────────────────────────────
// หน้าแรกสุดของระบบเมื่อผู้ใช้พิมพ์ URL ของเว็บไซต์หลัก
// หน้าที่หลัก: ส่งตัวผู้ใช้ไปยังหน้าจอหลัก (/home) ทันที เพื่อแสดงแดชบอร์ดสมาชิก

import { redirect } from "next/navigation";

export default function RootPage() {
  // สั่งเปลี่ยนเส้นทางไปยัง /home โดยอัตโนมัติ (Server-side redirect)
  redirect("/home");
}

