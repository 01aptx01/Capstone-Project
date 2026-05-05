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
import { useLang } from "@/lib/i18n/lang";

export type RevenueChartProps = {
  /** When omitted (e.g. reports page placeholder), chart shows empty state. */
  data?: RechartsSalesDatum[];
  loading?: boolean;
};

function formatTooltipValue(v: number) {
  return `฿${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RevenueChart({ data = [], loading }: RevenueChartProps) {
  const { t } = useLang();
  if (loading) {
    return (
      <div className="vibrant-card !rounded-[40px] p-10 h-full min-h-[320px] flex items-center justify-center font-bold" style={{ color: "var(--text-muted)" }}>
        {t("chart.loading")}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="vibrant-card !rounded-[40px] p-10 h-full min-h-[320px] flex items-center justify-center font-bold" style={{ color: "var(--text-muted)" }}>
        {t("chart.empty")}
      </div>
    );
  }

  return (
    <div className="vibrant-card !rounded-[40px] p-10 h-full shadow-2xl shadow-orange-900/[0.03] group/chart">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[24px] font-black tracking-tight" style={{ color: "var(--text)" }}>
              {t("chart.title")}
            </h3>
          </div>
          <p className="text-[14px] font-semibold" style={{ color: "var(--text-muted)" }}>
            {t("chart.subtitle").replace("{n}", String(data.length))}
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fontWeight: 700, fill: "var(--chart-tick)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--chart-axis)" }}
            />
            <YAxis
              tick={{ fontSize: 12, fontWeight: 600, fill: "var(--chart-tick)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid var(--chart-tooltip-border)",
                background: "var(--chart-tooltip-bg)",
                color: "var(--text)",
                fontWeight: 700,
              }}
              formatter={(value) => [
                formatTooltipValue(typeof value === "number" ? value : Number(value)),
                t("chart.revenue"),
              ]}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as RechartsSalesDatum | undefined;
                return row ? `${row.date} · ${row.count} ${t("chart.ordersUnit")}` : "";
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--chart-series-1)"
              strokeWidth={3}
              dot={{ r: 5, fill: "var(--chart-dot-bg)", stroke: "var(--chart-series-1)", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
