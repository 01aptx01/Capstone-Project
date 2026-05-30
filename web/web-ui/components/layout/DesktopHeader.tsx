"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CartNavButton } from "@/components/layout/CartNavButton";
import { DesktopSearchInput } from "@/components/layout/DesktopSearchInput";
import { getPageTitle } from "@/lib/navigation";

export function DesktopHeader() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageTitle = getPageTitle(pathname);
  const urlQuery = searchParams?.get("q") ?? "";

  const submitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      const query = params.toString();
      router.push(query ? `/home?${query}` : "/home");
    },
    [router],
  );

  return (
    <header
      className="hidden md:flex sticky top-0 z-[var(--z-header)] items-center gap-4 border-b border-border bg-surface/95 px-6 backdrop-blur-sm lg:px-8"
      style={{ height: "var(--topbar-height)" }}
    >
      <div className="min-w-0 shrink-0">
        <h1 className="truncate text-sm font-bold text-foreground lg:text-base">
          {pageTitle}
        </h1>
      </div>

      <DesktopSearchInput
        key={urlQuery}
        initialQuery={urlQuery}
        onSubmit={submitSearch}
      />
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <CartNavButton />
        <Link
          href="/profile"
          aria-label="โปรไฟล์"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-brand-muted text-lg shadow-sm transition-colors hover:bg-brand-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          🧑
        </Link>
      </div>
    </header>
  );
}
