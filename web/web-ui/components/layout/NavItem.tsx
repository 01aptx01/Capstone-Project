"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function NavItem({
  href,
  label,
  icon,
  active = false,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "w-full flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all touch-target",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        active
          ? "bg-brand-muted text-brand border-l-[3px] border-brand pl-[calc(1rem-3px)] pr-4"
          : "text-muted hover:bg-background border-l-[3px] border-transparent px-4",
      )}
    >
      <span className={active ? "text-brand" : "text-muted"}>{icon}</span>
      {label}
    </Link>
  );
}
