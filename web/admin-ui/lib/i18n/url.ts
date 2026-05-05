import type { Lang } from "./dictionaries";

function splitHash(href: string): { base: string; hash: string } {
  const i = href.indexOf("#");
  if (i === -1) return { base: href, hash: "" };
  return { base: href.slice(0, i), hash: href.slice(i) };
}

function splitQuery(href: string): { path: string; query: string } {
  const i = href.indexOf("?");
  if (i === -1) return { path: href, query: "" };
  return { path: href.slice(0, i), query: href.slice(i + 1) };
}

export function withLang(href: string, lang: Lang): string {
  const { base, hash } = splitHash(href);
  const { path, query } = splitQuery(base);
  const sp = new URLSearchParams(query);
  sp.set("lang", lang);
  const qs = sp.toString();
  return qs ? `${path}?${qs}${hash}` : `${path}${hash}`;
}

