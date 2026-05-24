"use client";

import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatBRL } from "@/lib/format";

type Capture = { capturedAt: Date | string; amountCapturedCents: bigint | number };

export function CaptureProgressChart({ captures }: { captures: Capture[] }) {
  const data = useMemo(() => {
    const days = 14;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const buckets: Record<string, { date: string; _ts: number; value: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      buckets[k] = { date: k, _ts: d.getTime(), value: 0 };
    }
    for (const c of captures) {
      const d = c.capturedAt instanceof Date ? c.capturedAt : new Date(c.capturedAt);
      const k = d.toISOString().slice(0, 10);
      if (!buckets[k]) continue;
      buckets[k].value +=
        typeof c.amountCapturedCents === "bigint"
          ? Number(c.amountCapturedCents)
          : c.amountCapturedCents;
    }
    return Object.values(buckets).sort((a, b) => a._ts - b._ts);
  }, [captures]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          }}
          stroke="oklch(0.4 0 0 / 0.45)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "oklch(0.18 0.025 50)",
            border: "none",
            borderRadius: 10,
            color: "white",
            fontSize: 12,
          }}
          formatter={(v) => [formatBRL(typeof v === "number" ? v : 0), "Capturado"]}
          labelFormatter={(label) => {
            const d = new Date(label);
            return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
          }}
          cursor={{ fill: "oklch(0.55 0.17 35 / 0.08)" }}
        />
        <Bar dataKey="value" fill="oklch(0.55 0.17 35)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
