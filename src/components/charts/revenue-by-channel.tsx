"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBRL } from "@/lib/format";

type Tx = {
  receivedAt: Date | string;
  valueCents: bigint | string | number;
  channelLabel: string;
};

type Props = {
  transactions: Tx[];
  days?: number;
  height?: number;
};

const COLORS = ["#c2410c", "#ca8a04", "#15803d", "#9f1239", "#a16207"];

export function RevenueByChannelChart({ transactions, days = 30, height = 280 }: Props) {
  const { data, channels } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const channelSet = new Set<string>();
    const byDay = new Map<string, Record<string, number>>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { date: key, _ts: d.getTime() } as unknown as Record<string, number>);
    }

    for (const tx of transactions) {
      const date = tx.receivedAt instanceof Date ? tx.receivedAt : new Date(tx.receivedAt);
      const key = date.toISOString().slice(0, 10);
      if (!byDay.has(key)) continue;
      const value = typeof tx.valueCents === "bigint"
        ? Number(tx.valueCents)
        : typeof tx.valueCents === "string"
          ? Number(tx.valueCents)
          : tx.valueCents;
      const row = byDay.get(key)!;
      row[tx.channelLabel] = (row[tx.channelLabel] ?? 0) + value;
      channelSet.add(tx.channelLabel);
    }

    return {
      data: [...byDay.values()].sort((a, b) => (a as any)._ts - (b as any)._ts),
      channels: [...channelSet],
    };
  }, [transactions, days]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {channels.map((ch, i) => (
            <linearGradient key={ch} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="oklch(0 0 0 / 0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="oklch(0.4 0 0 / 0.5)"
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          }}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={32}
        />
        <YAxis
          stroke="oklch(0.4 0 0 / 0.5)"
          tickFormatter={(v) =>
            formatBRL(v, { compact: true })
          }
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={62}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.18 0.025 50)",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontSize: 12,
            padding: "8px 12px",
          }}
          itemStyle={{ color: "white" }}
          labelStyle={{ color: "white", marginBottom: 4 }}
          formatter={(value, name) => [
            formatBRL(typeof value === "number" ? value : 0),
            name,
          ]}
          labelFormatter={(label) => {
            const d = new Date(label);
            return d.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
            });
          }}
        />
        {channels.map((ch, i) => (
          <Area
            key={ch}
            type="monotone"
            dataKey={ch}
            stackId="1"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={1.5}
            fill={`url(#grad-${i})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
