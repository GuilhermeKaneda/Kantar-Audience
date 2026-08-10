"use client";

import { useEffect, useState } from "react";
import FilterHeader from "@/components/FilterHeader";
import EvolutionChart from "@/components/EvolutionChart";
import EvolutionTable from "@/components/EvolutionTable";
import { defaultFilters } from "@/lib/defaultFilters";
import {
  getAvgRatingAndSharePerTimeSlot,
  getDistinctBroadcasters,
  getDistinctMarkets,
} from "@/services/audienceService";

const PALETTE = [
  "#4a9eff",
  "#4ade80",
  "#facc15",
  "#f87171",
  "#c084fc",
  "#38bdf8",
  "#fb923c",
  "#a3e635",
];

function cleanParams(filters) {
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  if (!filters.broadcaster.includes("Todos"))
    params.broadcaster = filters.broadcaster;

  if (!filters.market.includes("Todos"))
    params.market = filters.market;

  return params;
}

function buildChartData(rows, field) {
  const data = {};

  for (const row of rows) {
    const { broadcaster, timeSlot } = row;

    data[timeSlot] ??= { timeSlot };
    data[timeSlot][broadcaster] = row[field];
  }

  return Object.values(data);
}

export default function VisaoGeralPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [markets, setMarkets] = useState([]);
  const [broadcasters, setBroadcasters] = useState([]);

  const [charts, setCharts] = useState({ rating: [], share: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDistinctMarkets().then(setMarkets);

    getDistinctBroadcasters().then((names) =>
      setBroadcasters(
        names.map((nome, i) => ({
          nome,
          cor: PALETTE[i % PALETTE.length],
        }))
      )
    );
  }, []);

  useEffect(() => {

    async function loadData() {
      setLoading(true);

      try {
        const timeSlotData = await getAvgRatingAndSharePerTimeSlot(cleanParams(filters));

        setCharts({
          rating: buildChartData(timeSlotData, "avgRating"),
          share: buildChartData(timeSlotData, "avgShare"),
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters, broadcasters]);

  return (
    <>
      <FilterHeader
        filters={filters}
        onChange={setFilters}
        markets={markets}
        broadcasters={broadcasters}
      />

      <h1 className="page-title">Análise Competitiva</h1>
      <p className="page-subtitle">
        Comparativo de desempenho por faixa horária
      </p>

      {error && <p>{error}</p>}

      {!loading && (
        <>
          <div className="chart-card">
            <EvolutionChart
              title="Evolução da Audiência"
              data={charts.rating}
              dataKey="timeSlot"
              broadcasters={broadcasters}
              yFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />

            <EvolutionTable
              rows={charts.rating}
              rowKey={{ key: "timeSlot", label: "FAIXA HORÁRIA" }}
              columns={broadcasters.map((b) => ({ key: b.nome, label: b.nome, cor: b.cor }))}
            />
          </div>

          <div className="chart-card">
            <EvolutionChart
              title="Evolução do Share"
              data={charts.share}
              dataKey="timeSlot"
              broadcasters={broadcasters}
              yFormatter={(v) => `${v.toFixed(1)}%`}
            />

            <EvolutionTable
              share={true}
              rows={charts.share}
              rowKey={{ key: "timeSlot", label: "FAIXA HORÁRIA" }}
              columns={broadcasters.map((b) => ({ key: b.nome, label: b.nome, cor: b.cor }))}
            />
          </div>
        </>
      )}
    </>
  );
}