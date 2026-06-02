import { digitsOnly } from "@/lib/integer-input";

/** Default seconds used by machine/agent when unset. */
export const DEFAULT_HEATING_TIME_SEC = 15;

export const MIN_HEATING_TIME_SEC = 1;

export const MAX_HEATING_TIME_SEC = 3600;

export function parseHeatingTimeSeconds(raw: string): number | null {
  const s = digitsOnly(raw.trim());
  if (!s) return null;
  return parseInt(s, 10);
}

export function resolveHeatingTimeSeconds(raw: string): number {
  const parsed = parseHeatingTimeSeconds(raw);
  if (parsed === null || !isValidHeatingTimeSeconds(parsed)) {
    return DEFAULT_HEATING_TIME_SEC;
  }
  return parsed;
}

export function isValidHeatingTimeSeconds(n: number): boolean {
  return (
    Number.isInteger(n) &&
    n >= MIN_HEATING_TIME_SEC &&
    n <= MAX_HEATING_TIME_SEC
  );
}
