"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DICTS, normalizeLang, type DictKey, type Lang } from "./dictionaries";
import { withLang } from "./url";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
  href: (path: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  const lang = useMemo(() => normalizeLang(searchParams?.get("lang")), [searchParams]);

  const t = useCallback(
    (key: DictKey) => {
      const dict = DICTS[lang];
      return dict[key] ?? key;
    },
    [lang]
  );

  const href = useCallback((path: string) => withLang(path, lang), [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      const sp = new URLSearchParams(searchParams?.toString() ?? "");
      sp.set("lang", next);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t,
      href,
    }),
    [href, lang, setLang, t]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

