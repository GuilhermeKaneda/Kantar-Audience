"use client";

import { useEffect, useState } from "react";
import FilterHeader from "@/components/FilterHeader";
import EvolutionChart from "@/components/EvolutionChart";
import EvolutionTable from "@/components/EvolutionTable";
import WeekDayFilter from "@/components/WeekDayFilter";
import { defaultFilters } from "@/lib/defaultFilters";
import {
  getAvgRatingAndSharePerWeekDay,
  getDistinctBroadcasters,
  getDistinctMarkets,
  getDistinctWeekDays,
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

  if (filters.weekDay.length > 0)
    params.weekDay = filters.weekDay;

  return params;
}

function buildChartData(rows, field) {
  const data = {};

  for (const row of rows) {
    const { broadcaster, weekDay } = row;

    data[weekDay] ??= { weekDay };
    data[weekDay][broadcaster] = row[field];
  }

  return Object.values(data);
}

export default function SemanaPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [markets, setMarkets] = useState([]);
  const [broadcasters, setBroadcasters] = useState([]);
  const [weekDays, setWeekDays] = useState([]);

  const [charts, setCharts] = useState({ rating: [], share: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDistinctMarkets().then(setMarkets);

    getDistinctWeekDays().then(setWeekDays);

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
        const weekDayData = await getAvgRatingAndSharePerWeekDay(cleanParams(filters));

        setCharts({
          rating: buildChartData(weekDayData, "avgRating"),
          share: buildChartData(weekDayData, "avgShare"),
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

      <h1 className="page-title">Semana</h1>
      <p className="page-subtitle">Análise de desempenho por dia da semana</p>

      <div className="chart-card">
        <WeekDayFilter
          weekDays={weekDays}
          selected={filters.weekDay}
          onChange={(weekDay) => setFilters({ ...filters, weekDay })}
        />
      </div>

      {error && <p>{error}</p>}

      {!loading && (
        <>
          <div className="chart-card">
            <EvolutionChart
              title="Audiência por dia da semana"
              data={charts.rating}
              dataKey="weekDay"
              broadcasters={broadcasters}
              yFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />

            <EvolutionTable
              rows={charts.rating}
              rowKey={{ key: "weekDay", label: "DIA DA SEMANA" }}
              columns={broadcasters.map((b) => ({ key: b.nome, label: b.nome, cor: b.cor }))}
            />
          </div>

          <div className="chart-card">
            <EvolutionChart
              title="Share por dia da semana"
              data={charts.share}
              dataKey="weekDay"
              broadcasters={broadcasters}
              yFormatter={(v) => `${v.toFixed(1)}%`}
            />

            <EvolutionTable
              share={true}
              rows={charts.share}
              rowKey={{ key: "weekDay", label: "DIA DA SEMANA" }}
              columns={broadcasters.map((b) => ({ key: b.nome, label: b.nome, cor: b.cor }))}
            />
          </div>
        </>
      )}
    </>
  );
}