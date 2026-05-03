import type {
  ApiCoupon,
  ApiCustomer,
  ApiMachineSummary,
  ApiOrderListItem,
  ApiProduct,
} from "./admin-api";
import { getMachine, listMachines } from "./admin-api";

/** DB category -> Thai label shown in admin UI */
export const CATEGORY_TO_LABEL: Record<string, string> = {
  meat: "หมูสับ/หมูแดง",
  vegetarian: "เจ / มังสวิรัติ",
  sweet: "ไส้หวาน",
};

/** Thai label -> DB category for POST/PUT */
export const LABEL_TO_CATEGORY: Record<string, string> = {
  "หมูสับ/หมูแดง": "meat",
  "เจ / มังสวิรัติ": "vegetarian",
  มังสวิรัติ: "vegetarian",
  "ไส้หวาน": "sweet",
  เครื่องดื่ม: "meat",
};

export function apiCategoryToLabel(cat: string): string {
  return CATEGORY_TO_LABEL[cat] || cat;
}

export function uiLabelToApiCategory(label: string): string {
  return LABEL_TO_CATEGORY[label] || "meat";
}

/** Product row for ProductTable / export */
export type UiProductRow = {
  id: string;
  code: string;
  name: string;
  category?: string;
  machines?: number;
  quantity?: number;
  unit_price?: number;
  status?: string;
  image?: string;
  description?: string;
  product_id: number;
};

export function apiProductToUiRow(
  p: ApiProduct,
  stock?: { quantity: number; machines: number }
): UiProductRow {
  const qty = stock?.quantity ?? 0;
  let status = "in_stock";
  if (qty <= 0) status = "out_of_stock";
  else if (qty < 20) status = "low_stock";

  return {
    product_id: p.product_id,
    id: String(p.product_id),
    code: `P${String(p.product_id).padStart(3, "0")}`,
    name: p.name,
    category: apiCategoryToLabel(p.category),
    machines: stock?.machines ?? 0,
    quantity: qty,
    unit_price: p.price,
    status,
    image: p.image_url || undefined,
    description: p.description || undefined,
  };
}

/**
 * Sum slot quantities per product_id across all machines (bounded fetches).
 */
export async function buildProductStockMap(): Promise<
  Map<number, { quantity: number; machines: Set<string> }>
> {
  const map = new Map<number, { quantity: number; machines: Set<string> }>();
  const { items: machines } = await listMachines({ page: 1, per_page: 200 });
  const codes = machines.map((m) => m.machine_code);
  const chunk = 8;
  for (let i = 0; i < codes.length; i += chunk) {
    const batch = codes.slice(i, i + chunk);
    const details = await Promise.all(
      batch.map((c) => getMachine(c).catch(() => null))
    );
    for (const detail of details) {
      if (!detail) continue;
      const code = detail.machine_code;
      for (const slot of detail.slots || []) {
        const pid = slot.product_id;
        const q = slot.quantity || 0;
        let entry = map.get(pid);
        if (!entry) {
          entry = { quantity: 0, machines: new Set<string>() };
          map.set(pid, entry);
        }
        entry.quantity += q;
        if (q > 0) entry.machines.add(code);
      }
    }
  }
  return map;
}

export async function enrichProductsWithStock(
  products: ApiProduct[]
): Promise<UiProductRow[]> {
  let stockMap: Map<number, { quantity: number; machines: Set<string> }>;
  try {
    stockMap = await buildProductStockMap();
  } catch {
    stockMap = new Map();
  }
  return products.map((p) => {
    const s = stockMap.get(p.product_id);
    return apiProductToUiRow(p, {
      quantity: s?.quantity ?? 0,
      machines: s?.machines.size ?? 0,
    });
  });
}

export type UiMachineCard = {
  id: string;
  name: string;
  location: string;
  status?: string;
  image?: string;
};

export function apiMachineToCard(m: ApiMachineSummary): UiMachineCard {
  return {
    id: m.machine_code,
    name: m.machine_code,
    location: m.location || "—",
    status: m.status,
    image: undefined,
  };
}

export type UiOrderRow = {
  id: string;
  time: string;
  items: string;
  amount: number;
  status: string;
  machine_code?: string;
  customer_phone?: string | null;
};

export function apiOrderToUiRow(o: ApiOrderListItem): UiOrderRow {
  const txCount = Array.isArray(o.transactions) ? o.transactions.length : 0;
  return {
    id: String(o.order_id),
    time: o.created_at || "—",
    items: txCount > 0 ? String(txCount) : "—",
    amount: o.total_price,
    status: o.status,
    machine_code: o.machine_code,
    customer_phone: o.customer_phone,
  };
}

/** Coupon row shape for CouponTable */
export type UiCouponRow = {
  id: string;
  name: string;
  type: string;
  points: number;
  usage: number;
  maxUsage: number;
  expiry: string | null;
  status: string;
  promotion_id: number;
  discount_amount: number;
  is_active: boolean;
};

export function apiCouponToUiRow(c: ApiCoupon): UiCouponRow {
  const now = new Date();
  const exp = c.expire_date ? new Date(c.expire_date) : null;
  let status = "inactive";
  if (c.is_active && (!exp || exp >= now)) status = "active";
  else if (exp && exp < now) status = "expired";

  return {
    promotion_id: c.promotion_id,
    id: c.code,
    name: c.code,
    type: c.type === "percent" ? "PERCENT" : "FIXED",
    points: 0,
    usage: 0,
    maxUsage: 0,
    expiry: c.expire_date,
    status,
    discount_amount: c.discount_amount,
    is_active: c.is_active,
  };
}

export function summarizeCustomers(customers: ApiCustomer[]): {
  memberCount: number;
  totalPoints: number;
} {
  return {
    memberCount: customers.length,
    totalPoints: customers.reduce((s, c) => s + (c.points || 0), 0),
  };
}

export function summarizeOrdersFromItems(
  items: ApiOrderListItem[]
): {
  total: number;
  pending: number;
  processing: number;
  completed: number;
} {
  const total = items.length;
  let pending = 0;
  let processing = 0;
  let completed = 0;
  for (const o of items) {
    const s = o.status.toLowerCase();
    if (s === "pending_payment" || s === "cancelled" || s === "payment_failed")
      pending++;
    else if (
      s === "paid" ||
      s === "dispensing" ||
      s === "dispense_failed"
    )
      processing++;
    else if (s === "completed") completed++;
  }
  return { total, pending, processing, completed };
}
