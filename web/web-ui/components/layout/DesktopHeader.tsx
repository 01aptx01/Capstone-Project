"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DesktopSearchInput } from "@/components/layout/DesktopSearchInput";

export function DesktopHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      className="hidden md:flex sticky top-0 z-(--z-header) items-center gap-4 border-b border-border bg-surface/95 px-6 backdrop-blur-sm lg:px-8"
      style={{ height: "var(--topbar-height)" }}
    >
      <DesktopSearchInput
        initialQuery={urlQuery}
        onSubmit={submitSearch}
      />
    </header>
  );
}
