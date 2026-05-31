"use client";

import { useState, useEffect } from "react";
import { IconSearch } from "@/components/icons";
import { cn } from "@/lib/utils";

interface DesktopSearchInputProps {
  initialQuery: string;
  onSubmit: (value: string) => void;
}

export function DesktopSearchInput({
  initialQuery,
  onSubmit,
}: DesktopSearchInputProps) {
  const [searchValue, setSearchValue] = useState(initialQuery);

  useEffect(() => {
    setSearchValue(initialQuery);
  }, [initialQuery]);

  return (
    <div className="relative mx-auto hidden w-full max-w-md lg:block">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        <IconSearch />
      </span>
      <input
        type="search"
        value={searchValue}
        onChange={(e) => {
          const val = e.target.value;
          setSearchValue(val);
          onSubmit(val);
        }}
        placeholder="ค้นหาไส้ซาลาเปา..."
        aria-label="ค้นหาเมนู"
        className={cn(
          "w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-sm font-medium text-foreground",
          "placeholder:text-muted shadow-sm transition-colors",
          "focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        )}
      />
    </div>
  );
}
