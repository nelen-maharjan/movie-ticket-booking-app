"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold mb-6">Revenue — Last 30 Days</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5C518" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }}
            tickFormatter={v => format(parseISO(v), "d MMM")} />
          <YAxis stroke="#666" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
          <Tooltip
  contentStyle={{
    background: "#1A1A26",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    fontSize: 12,
  }}
  labelFormatter={(l) =>
    typeof l === "string"
      ? format(parseISO(l), "d MMM yyyy")
      : String(l)
  }
  formatter={(value) => {
    if (typeof value !== "number") {
      return [String(value), "Revenue"];
    }
    return [formatCurrency(value), "Revenue"];
  }}
/>
          <Area type="monotone" dataKey="revenue" stroke="#F5C518" strokeWidth={2} fill="url(#revenueGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
