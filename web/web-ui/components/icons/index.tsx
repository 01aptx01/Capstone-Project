// components/icons/index.tsx
// ─── ALL SVG ICON COMPONENTS ──────────────────────────────────────────────────
// คอลเลกชันไอคอน SVG สำหรับเรียกใช้งานในหน้าเว็บและระบบนำทาง (Icons Library)
// เขียนเป็น React Functional Component เพื่อให้ง่ายต่อการเปลี่ยนสไตล์ ขนาด และสีผ่าน Props

// ไอคอนสามขีด (Hamburger Menu Icon) สำหรับหน้าจอขนาดมือถือ
export function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ไอคอนปิดกากบาท (Close/Cancel Icon) สำหรับปิดหน้าต่าง Modal หรือ Drawer
export function CloseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ไอคอนรูปหน้าแรก (Home Icon)
export function IconHome({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// ไอคอนรูปกล่องของขวัญ/แลกคูปอง (Redeem/Gift Icon)
export function IconRedeem({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="9" width="20" height="3" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="12" width="16" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 9C12 9 9 5 7 6s-1 3 5 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9C12 9 15 5 17 6s1 3-5 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// ไอคอนรูปนาฬิกาประวัติการใช้งาน (History/Clock Icon)
export function IconHistory({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 109-9 9 9 0 00-7.74 4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 7v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ไอคอนรูปโปรไฟล์/ผู้ใช้งาน (Profile/User Icon)
export function IconProfile({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ไอคอนออกจากระบบ (Logout Icon)
export function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16 17l5-5-5-5M21 12H9M13 3H5a2 2 0 00-2 2v14a2 2 0 002 2h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ไอคอนรูปคูปองกระดาษ (Coupons/Ticket Icon)
export function IconCoupons({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 6v12M15 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 3" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ไอคอนรูปเครื่องหมายคำถาม/ศูนย์ช่วยเหลือ (Help/FAQ Icon)
export function IconHelp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 9a2.5 2.5 0 014.5 1.5c0 2-2.5 2-2.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" />
    </svg>
  );
}

// ไอคอนรูปแว่นขยายค้นหา (Search Icon)
export function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ไอคอนรูปกระดิ่งแจ้งเตือน (Bell/Notification Icon)
export function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 10a6 6 0 0112 0v4l2 2H4l2-2v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 19a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ไอคอนรูปรถเข็น/ตะกร้าสินค้า (Cart Icon)
export function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M2 2h2l2.4 12h10.8L19 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ไอคอนรูปเมนูรายการอาหาร/หมวดหมู่
export function IconMenu() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}