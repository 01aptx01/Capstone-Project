export type FulfillmentMode = "immediate" | "pickup";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const MACHINE_CODE =
  process.env.NEXT_PUBLIC_MACHINE_CODE ?? "MP1-001";

export const FULFILLMENT_MODE = (
  process.env.NEXT_PUBLIC_FULFILLMENT_MODE ?? "immediate"
) as FulfillmentMode;

export const OMISE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY ?? "";

export const AUTH_DEV_BYPASS =
  process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS === "true";
