"use client";

import { useEffect, useState } from "react";
import FilterHeader from "@/components/FilterHeader";
import EmissoraCard from "@/components/EmissoraCard";
import EvolutionChart from "@/components/EvolutionChart";
import StackChart from "@/components/StackChart";
import { defaultFilters } from "@/lib/defaultFilters";
import {
  getAvgRatingAndShare,
  getAvgRatingAndSharePerDay,
  getAvgRatingAndSharePerTarget,
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

// funcao para remover "Todos" os parametros das requisicoes e para filtrar apenas os valores ativos no filtro
function cleanParams(filters, broadcaster) {
  const params = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  // se nao for card de emissora (apenas o card passa o parametro broadcaster), usa o filtro de emissora
  if (broadcaster)
    params.broadcaster = [broadcaster];
  else if (!filters.broadcaster.includes("Todos"))
    params.broadcaster = filters.broadcaster;

  if (!filters.market.includes("Todos"))
    params.market = filters.market;

  return params;
}

// funcao para montar os dados do chart
// ex: { date: "2023-01-01", Globo: 100, SBT: 50 }
function buildChartData(rows, field) {
  const data = {};

  for (const row of rows) {
    const { broadcaster, date } = row;

    data[date] ??= { date };
    data[date][broadcaster] = row[field];
  }

  return Object.values(data);
}

// funcao para montar os dados do chart de targets
// ex: { target: "AB", Globo: 100, SBT: 50 }
function buildTargetChartData(rows) {
  const data = {};

  for (const row of rows) {
    const { targetGroup, target, broadcaster, avgRating } = row;

    data[targetGroup] ??= {};
    data[targetGroup][target] ??= { target };
    data[targetGroup][target][broadcaster] = avgRating;
  }

  for (const targetGroup in data) {
    data[targetGroup] = Object.values(data[targetGroup]);
  }

  return data;
}

export default function VisaoGeralPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [markets, setMarkets] = useState([]);
  const [broadcasters, setBroadcasters] = useState([]);
  const [emissoraCards, setEmissoraCards] = useState([]);

  const [charts, setCharts] = useState({ rating: [], share: [] });
  const [ratingByTarget, setRatingByTarget] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let activeBroadcasters;

  // variavel para selecionar apenas os broadcasters ativos no filtro, para os charts
  if (filters.broadcaster.includes("Todos"))
    activeBroadcasters = broadcasters;
  else
    activeBroadcasters = broadcasters.filter((b) => filters.broadcaster.includes(b.nome));

  useEffect(() => {
    // requisições para os filtros
    getDistinctMarkets().then(setMarkets);

    // requisição para emissoras e atribui cores a elas
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
        const [dayData, targetData, summaries] = await Promise.all([
          // requisições para os charts
          getAvgRatingAndSharePerDay(cleanParams(filters)),
          getAvgRatingAndSharePerTarget(cleanParams(filters)),
          // requisições para os cards, uma para cada emissora 
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

        setRatingByTarget(buildTargetChartData(targetData));

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
              broadcasters={activeBroadcasters}
              yFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
          </div>

          <div className="chart-card">
            <EvolutionChart
              title="Evolução do Share"
              data={charts.share}
              dataKey="date"
              broadcasters={activeBroadcasters}
              yFormatter={(v) => `${v.toFixed(1)}%`}
            />
          </div>

          <div className="stack-charts-row">
            {Object.keys(ratingByTarget).map((groupName) => (
              <StackChart
                key={groupName}
                title={`Audiência por ${groupName}`}
                data={ratingByTarget[groupName]}
                categoryKey="target"
                stackKeys={activeBroadcasters.map((b) => ({
                  key: b.nome,
                  label: b.nome,
                  cor: b.cor,
                }))}
              />
            ))}
          </div>

        </>
      )}
    </>
  );
}