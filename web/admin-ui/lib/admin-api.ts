/**
 * Browser-side client for Flask /api/admin (same pattern as machine-ui NEXT_PUBLIC_API_URL).
 */

import { api } from "./axios";

export function adminBaseUrl(): string {
  return (
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_ADMIN_API_URL?.replace(/\/$/, "")) ||
    "http://localhost:8000"
  );
}

function adminUrl(path: string): string {
  const base = adminBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api/admin${p}`;
}

async function adminFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...((init?.headers as Record<string, string>) || {}),
  };
  const res = await fetch(adminUrl(path), { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error(`Invalid JSON from admin API (${res.status})`);
    }
  }
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: string }).error)
        : res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data as T;
}

export type Paginated<T> = {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
};

export type ApiProduct = {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  heating_time: number | null;
  category: string;
};

export type ApiMachineSummary = {
  machine_code: string;
  location: string | null;
  status: string;
  last_active: string | null;
};

export type ApiMachineSlot = {
  id: number;
  slot_number: number;
  product_id: number;
  quantity: number;
  product: {
    product_id: number;
    name: string;
    price: number;
  } | null;
};

export type ApiMachineDetail = ApiMachineSummary & { slots: ApiMachineSlot[] };

export type ApiCustomer = {
  user_id: number;
  phone_number: string;
  points: number;
  status: string;
  registered_at: string | null;
  last_use: string | null;
};

export type ApiOrderSummary = {
  order_id: number;
  status: string;
  total_price: number;
  created_at: string | null;
  charge_id: string | null;
};

export type ApiOrderListItem = {
  order_id: number;
  machine_code: string;
  user_id: number | null;
  customer_phone: string | null;
  promotion_id: number | null;
  charge_id: string | null;
  total_price: number;
  payment_method: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  transactions: {
    id: number;
    provider: string;
    provider_ref: string | null;
    amount: number;
    currency: string;
    status: string;
    created_at: string | null;
  }[];
};

export type ApiCoupon = {
  promotion_id: number;
  code: string;
  type: string;
  discount_amount: number;
  is_active: boolean;
  expire_date: string | null;
};

export async function listProducts(params?: {
  page?: number;
  per_page?: number;
  q?: string;
}): Promise<Paginated<ApiProduct>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  if (params?.q) sp.set("q", params.q);
  const q = sp.toString();
  return adminFetch<Paginated<ApiProduct>>(
    `/products${q ? `?${q}` : ""}`
  );
}

export async function createProduct(body: {
  name: string;
  price: number;
  description?: string | null;
  image_url?: string | null;
  heating_time?: number | null;
  category?: string;
}): Promise<ApiProduct> {
  return adminFetch<ApiProduct>("/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateProduct(
  productId: number,
  body: Partial<{
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
    heating_time: number | null;
    category: string;
  }>
): Promise<ApiProduct> {
  return adminFetch<ApiProduct>(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteProduct(productId: number): Promise<void> {
  await adminFetch<{ status: string }>(`/products/${productId}`, {
    method: "DELETE",
  });
}

export async function listMachines(params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<Paginated<ApiMachineSummary>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  if (params?.status) sp.set("status", params.status);
  const q = sp.toString();
  return adminFetch<Paginated<ApiMachineSummary>>(
    `/machines${q ? `?${q}` : ""}`
  );
}

export async function getMachine(
  machineCode: string
): Promise<ApiMachineDetail> {
  return adminFetch<ApiMachineDetail>(`/machines/${encodeURIComponent(machineCode)}`);
}

export async function listCustomers(params?: {
  page?: number;
  per_page?: number;
  q?: string;
}): Promise<Paginated<ApiCustomer>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  if (params?.q) sp.set("q", params.q);
  const q = sp.toString();
  return adminFetch<Paginated<ApiCustomer>>(
    `/customers${q ? `?${q}` : ""}`
  );
}

export async function getCustomer(userId: number): Promise<{
  customer: ApiCustomer;
  orders: ApiOrderSummary[];
}> {
  return adminFetch(`/customers/${userId}`);
}

export async function listOrders(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  machine_code?: string;
}): Promise<Paginated<ApiOrderListItem>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  if (params?.status) sp.set("status", params.status);
  if (params?.machine_code) sp.set("machine_code", params.machine_code);
  const q = sp.toString();
  return adminFetch<Paginated<ApiOrderListItem>>(
    `/orders${q ? `?${q}` : ""}`
  );
}

export async function listCoupons(params?: {
  page?: number;
  per_page?: number;
}): Promise<Paginated<ApiCoupon>> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.per_page) sp.set("per_page", String(params.per_page));
  const q = sp.toString();
  return adminFetch<Paginated<ApiCoupon>>(`/coupons${q ? `?${q}` : ""}`);
}

export async function createCoupon(body: {
  code: string;
  type: string;
  discount_amount: number;
  expire_date?: string | null;
  is_active?: boolean;
}): Promise<ApiCoupon> {
  return adminFetch<ApiCoupon>("/coupons", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateCoupon(
  promotionId: number,
  body: Partial<{
    is_active: boolean;
    expire_date: string | null;
    discount_amount: number;
    type: string;
    code: string;
  }>
): Promise<ApiCoupon> {
  return adminFetch<ApiCoupon>(`/coupons/${promotionId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** Flask GET /api/admin/dashboard/summary */
export type DashboardSummaryResponse = {
  total_sales_today: number;
  active_machines: number;
  top_products: {
    product_id: number;
    name: string;
    total_sold: number;
  }[];
};

/** Flask GET /api/admin/reports/sales */
export type SalesReportSeriesRow = {
  date: string;
  revenue: number;
  count: number;
};

export type SalesReportResponse = {
  days: number;
  series: SalesReportSeriesRow[];
};

/** Flask GET /api/admin/alerts */
export type AdminAlertsResponse = {
  stock_threshold: number;
  include_resolved?: boolean;
  low_stock: {
    machine_code: string;
    slot: number;
    product_id: number;
    product_name: string;
    quantity: number;
  }[];
  machine_errors: {
    id: number;
    machine_code: string;
    job_id: string | null;
    event_type: string;
    state: string;
    created_at: string | null;
    is_resolved?: boolean;
    resolved_at?: string | null;
  }[];
};

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const { data } = await api.get<DashboardSummaryResponse>(
    "/api/admin/dashboard/summary"
  );
  return data;
}

export async function getSalesReport(days: number): Promise<SalesReportResponse> {
  const { data } = await api.get<SalesReportResponse>("/api/admin/reports/sales", {
    params: { days },
  });
  return data;
}

export async function getAdminAlerts(params?: {
  stock_threshold?: number;
  /** When true, include resolved ERROR events in machine_errors. */
  include_resolved?: boolean;
}): Promise<AdminAlertsResponse> {
  const sp: Record<string, string> = {};
  if (params?.stock_threshold != null) {
    sp.stock_threshold = String(params.stock_threshold);
  }
  if (params?.include_resolved) {
    sp.include_resolved = "1";
  }
  const { data } = await api.get<AdminAlertsResponse>("/api/admin/alerts", {
    params: sp,
  });
  return data;
}

export type ResolveAlertResponse = {
  ok: boolean;
  id: number;
  is_resolved: boolean;
  resolved_at: string;
};

export async function resolveAlert(eventId: number): Promise<ResolveAlertResponse> {
  const { data } = await api.post<ResolveAlertResponse>(
    `/api/admin/alerts/resolve/${eventId}`
  );
  return data;
}
