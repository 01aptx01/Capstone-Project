import type {
  ApiCoupon,
  ApiCustomer,
  ApiMachineSummary,
  ApiOrderListItem,
  ApiProduct,
  DashboardSummaryResponse,
  SalesReportResponse,
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
  is_online?: boolean;
  last_active?: string | null;
  image?: string;
};

export function apiMachineToCard(m: ApiMachineSummary): UiMachineCard {
  return {
    id: m.machine_code,
    name: m.machine_code,
    location: m.location ?? "",
    status: m.status,
    is_online: m.is_online,
    last_active: m.last_active ?? null,
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
  payment_method?: string;
};

export function apiOrderToUiRow(o: ApiOrderListItem): UiOrderRow {
  const lines = Array.isArray(o.order_items) ? o.order_items : [];
  const lineCount =
    typeof o.item_line_count === "number"
      ? o.item_line_count
      : lines.length;
  const qtySum =
    typeof o.item_quantity_sum === "number"
      ? o.item_quantity_sum
      : lines.reduce((s, li) => s + (li.quantity || 0), 0);
  let itemsLabel = "—";
  if (lineCount > 0) {
    itemsLabel = `${lineCount} รายการ (${qtySum} ชิ้น)`;
  }
  return {
    id: String(o.order_id),
    time: o.created_at || "—",
    items: itemsLabel,
    amount: o.total_price,
    status: o.status,
    machine_code: o.machine_code,
    customer_phone: o.customer_phone,
    payment_method: o.payment_method,
  };
}

/** Coupon row shape for CouponTable */
export type UiCouponRow = {
  id: string;
  name: string;
  type: string;
  points: number;
  points_cost: number;
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

  const pointsCost =
    typeof c.points_cost === "number" && Number.isFinite(c.points_cost)
      ? Math.max(0, Math.floor(c.points_cost))
      : 0;

  return {
    promotion_id: c.promotion_id,
    id: c.code,
    name: c.code,
    type: c.type === "percent" ? "PERCENT" : "FIXED",
    points: pointsCost,
    points_cost: pointsCost,
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

/** Local calendar date YYYY-MM-DD (for matching Flask `date` buckets). */
export function localDateISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Stat card values derived from dashboard summary + sales series + auxiliary counts. */
export type UiDashboardStatCards = {
  salesTodayLabel: string;
  ordersToday: number;
  machinesOnline: number;
  machinesTotal: number;
  lowStockCount: number;
};

export function mapDashboardStats(params: {
  summary: DashboardSummaryResponse;
  salesReport: SalesReportResponse;
  machinesTotal: number;
  lowStockCount: number;
}): UiDashboardStatCards {
  const iso = localDateISO();
  const todayRow = params.salesReport.series.find((r) => r.date === iso);
  const ordersToday = todayRow?.count ?? 0;

  return {
    salesTodayLabel: formatBaht(params.summary.total_sales_today ?? 0),
    ordersToday,
    machinesOnline: params.summary.active_machines ?? 0,
    machinesTotal: params.machinesTotal,
    lowStockCount: params.lowStockCount,
  };
}

/** One row per day for Recharts (date + revenue + short label). */
export type RechartsSalesDatum = {
  date: string;
  revenue: number;
  count: number;
  label: string;
};

function shortChartDate(isoDate: string): string {
  if (isoDate.length >= 10) {
    const mm = isoDate.slice(5, 7);
    const dd = isoDate.slice(8, 10);
    return `${parseInt(dd, 10)}/${parseInt(mm, 10)}`;
  }
  return isoDate;
}

export function mapSalesReportToRechartsSeries(
  report: SalesReportResponse
): RechartsSalesDatum[] {
  const sorted = [...report.series].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  return sorted.map((row) => ({
    date: row.date,
    revenue: row.revenue,
    count: row.count,
    label: shortChartDate(row.date),
  }));
}

/** Buckets for existing SVG DashboardChart (Day / Week / Month toggles). */
export type LiveChartBuckets = {
  day: number[];
  week: number[];
  month: number[];
  labelsDay: string[];
  labelsWeek: string[];
  labelsMonth: string[];
};

export function mapSalesSeriesToChartBuckets(
  report: SalesReportResponse
): LiveChartBuckets {
  const sorted = [...report.series].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  if (sorted.length === 0) {
    return {
      day: [0, 0, 0, 0],
      week: [0, 0, 0, 0, 0, 0, 0],
      month: [0, 0, 0, 0],
      labelsDay: ["—", "—", "—", "—"],
      labelsWeek: ["M", "T", "W", "T", "F", "S", "S"],
      labelsMonth: ["W1", "W2", "W3", "W4"],
    };
  }

  const revs = sorted.map((s) => s.revenue);
  const labs = sorted.map((s) => shortChartDate(s.date));

  const day = revs.slice(-8);
  const labelsDay = labs.slice(-8);

  const week = revs.slice(-7);
  const labelsWeek = labs.slice(-7);

  const tail = sorted.slice(-28);
  const n = tail.length;
  const monthVals: number[] = [];
  const monthLabs: string[] = [];
  const seg = Math.max(1, Math.ceil(n / 4));
  for (let w = 0; w < 4; w++) {
    const chunk = tail.slice(w * seg, (w + 1) * seg);
    const sum = chunk.reduce((s, x) => s + x.revenue, 0);
    monthVals.push(sum);
    if (chunk.length === 0) {
      monthLabs.push(`W${w + 1}`);
    } else {
      monthLabs.push(
        `${shortChartDate(chunk[0].date)}–${shortChartDate(chunk[chunk.length - 1].date)}`
      );
    }
  }

  return {
    day: day.length ? day : [0],
    week: week.length ? week : [0],
    month: monthVals.length ? monthVals : [0, 0, 0, 0],
    labelsDay: labelsDay.length ? labelsDay : labs,
    labelsWeek: labelsWeek.length ? labelsWeek : labs,
    labelsMonth: monthLabs,
  };
}
