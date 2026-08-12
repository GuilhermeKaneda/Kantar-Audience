"use client";

import { useEffect, useState } from "react";
import FilterHeader from "@/components/FilterHeader";
import EmissoraCard from "@/components/EmissoraCard";
import EvolutionChart from "@/components/EvolutionChart";
import { defaultFilters } from "@/lib/defaultFilters";
import {
  getAvgRatingAndShare,
  getAvgRatingAndSharePerDay,
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

function cleanParams(filters, broadcaster) {
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  // se nao for card de emissora (apenas o card passa o parametro), usa o filtro de emissora
  if (broadcaster)
    params.broadcaster = [broadcaster];
  else if (!filters.broadcaster.includes("Todos"))
    params.broadcaster = filters.broadcaster;

  if (!filters.market.includes("Todos"))
    params.market = filters.market;

  return params;
}

function buildChartData(rows, field) {
  const data = {};

  for (const row of rows) {
    const { broadcaster, date } = row;

    data[date] ??= { date };
    data[date][broadcaster] = row[field];
  }

  return Object.values(data);
}


export default function VisaoGeralPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [markets, setMarkets] = useState([]);
  const [broadcasters, setBroadcasters] = useState([]);
  const [emissoraCards, setEmissoraCards] = useState([]);

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
        const [dayData, summaries] = await Promise.all([
          getAvgRatingAndSharePerDay(cleanParams(filters)),
          Promise.all(
            broadcasters.map((b) =>
              getAvgRatingAndShare(cleanParams(filters, b.nome))
            )
          ),
        ]);

        setCharts({
          rating: buildChartData(dayData, "avgRating"),
          share: buildChartData(dayData, "avgShare"),
        });

        setEmissoraCards(
          broadcasters.map((b, i) => ({
            ...b,
            audiencia: summaries[i]?.[0]?.avgRating ?? 0,
            share: summaries[i]?.[0]?.avgShare ?? 0,
          }))
        );
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

      <h1 className="page-title">Visão Geral</h1>
      <p className="page-subtitle">
        Indicadores executivos de audiência televisiva
      </p>

      {error && <p>{error}</p>}

      <div className="emissora-cards-row">
        {emissoraCards.map((em) => (
          <EmissoraCard key={em.nome} {...em} />
        ))}
      </div>

      {!loading && (
        <>
          <div className="chart-card">
            <EvolutionChart
              title="Evolução da Audiência"
              data={charts.rating}
              dataKey="date"
              broadcasters={broadcasters}
              yFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
          </div>

          <div className="chart-card">
            <EvolutionChart
              title="Evolução do Share"
              data={charts.share}
              dataKey="date"
              broadcasters={broadcasters}
              yFormatter={(v) => `${v.toFixed(1)}%`}
            />
          </div>

        </>
      )}
    </>
  );
}