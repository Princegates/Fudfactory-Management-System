"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SalesTrendChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f6c98c" opacity={0.4} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#5c2c14" />
        <YAxis tick={{ fontSize: 12 }} stroke="#5c2c14" />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#cc6a1f" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
