"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


function formatNumber(value) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export default function StackChart({ title, data, categoryKey, stackKeys, xFormatter = formatNumber }) {

  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" horizontal={false} />
          <XAxis type="number" stroke="#8b93a1" tick={{ fontSize: 12 }} tickFormatter={xFormatter} />
          <YAxis type="category" dataKey={categoryKey} stroke="#8b93a1" tick={{ fontSize: 12 }} width={90} />
          <Tooltip
            contentStyle={{ background: "#171b24", border: "1px solid #2a2f3a", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => xFormatter(value)}
          />
          <Legend verticalAlign="bottom" iconType="circle" formatter={(v) => <span style={{ color: "#c7cbd3" }}>{v}</span>} />
          {stackKeys.map(({ key, label, cor }) => (
            <Bar key={key} dataKey={key} name={label ?? key} stackId="share" fill={cor} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}