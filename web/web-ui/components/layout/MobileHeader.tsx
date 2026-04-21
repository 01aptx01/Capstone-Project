// components/layout/MobileHeader.tsx
import { IconMenu, CloseIcon } from "@/components/icons";

interface MobileHeaderProps {
  onMenuOpen: () => void;
  isOpen: boolean;
}

export function MobileHeader({ onMenuOpen, isOpen }: MobileHeaderProps) {
  return (
    // แสดงเฉพาะ Mobile (md:hidden) และเป็นสีส้มตามดีไซน์
    <header className="md:hidden sticky top-0 z-80 bg-[#FF8A33] px-5 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2">
        {/* ตรงนี้รอใส่ SVG Logo ของคุณครับ */}
        <div className="bg-white text-[#FF8A33] rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
          🥟
        </div>
        <span className="text-xl font-bold text-white uppercase tracking-wider">MOD PAO</span>
      </div>
      
      <button 
        onClick={onMenuOpen}
        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
      >
        {isOpen ? <CloseIcon /> : <IconMenu />}
      </button>
    </header>
  );
}