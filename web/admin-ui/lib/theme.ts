const STORAGE_KEY = "admin-ui-theme";

type StoredTheme = "dark" | "light";

function safeGetItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures (privacy mode, quota, etc.)
  }
}

export function getStoredDarkMode(): boolean | null {
  const raw = safeGetItem(STORAGE_KEY);
  if (raw === "dark") return true;
  if (raw === "light") return false;
  return null;
}

export function setStoredDarkMode(isDark: boolean): void {
  const v: StoredTheme = isDark ? "dark" : "light";
  safeSetItem(STORAGE_KEY, v);
}

export function applyDarkModeClass(isDark: boolean): void {
  try {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", isDark);
  } catch {
    // ignore
  }
}

