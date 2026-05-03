"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RechartsSalesDatum } from "@/lib/admin-mappers";

export type RevenueChartProps = {
  /** When omitted (e.g. reports page placeholder), chart shows empty state. */
  data?: RechartsSalesDatum[];
  loading?: boolean;
};

function formatTooltipValue(v: number) {
  return `฿${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RevenueChart({ data = [], loading }: RevenueChartProps) {
  if (loading) {
    return (
      <div className="vibrant-card !rounded-[40px] p-10 h-full min-h-[320px] flex items-center justify-center text-slate-500 font-bold">
        กำลังโหลดกราฟยอดขาย…
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="vibrant-card !rounded-[40px] p-10 h-full min-h-[320px] flex items-center justify-center text-slate-500 font-bold">
        ยังไม่มีข้อมูลยอดขายในช่วงที่เลือก
      </div>
    );
  }

  return (
    <div className="vibrant-card !rounded-[40px] p-10 h-full shadow-2xl shadow-orange-900/[0.03] group/chart">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[24px] font-black text-[#334155] tracking-tight">
              กราฟยอดการขาย
            </h3>
          </div>
          <p className="text-[14px] font-semibold text-slate-400">
            รายได้รายวัน (ออเดอร์สำเร็จ) จาก API — ช่วง {data.length} วันล่าสุด
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fontWeight: 700, fill: "#64748B" }}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
            />
            <YAxis
              tick={{ fontSize: 12, fontWeight: 600, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                fontWeight: 700,
              }}
              formatter={(value) => [
                formatTooltipValue(typeof value === "number" ? value : Number(value)),
                "รายได้",
              ]}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as RechartsSalesDatum | undefined;
                return row ? `${row.date} · ${row.count} ออเดอร์` : "";
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f47b2a"
              strokeWidth={3}
              dot={{ r: 5, fill: "#fff", stroke: "#f47b2a", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
