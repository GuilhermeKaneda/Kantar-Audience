"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function EvolutionChart({
  title,
  data,
  dataKey,
  broadcasters,
  yFormatter,
}) {
  return (
    <div>
      <div className="chart-title">{title}</div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid vertical={false} horizontal={false} strokeDasharray="3 3" />

          <XAxis dataKey={dataKey} />
          <YAxis tickFormatter={yFormatter} />

          <Tooltip contentStyle={{ background: "#171b24", border: "1px solid #2a2f3a", borderRadius: 8 }} formatter={yFormatter} />

          <Legend />

          {broadcasters.map(({ nome, cor }) => (
            <Line
              key={nome}
              dataKey={nome}
              stroke={cor}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}