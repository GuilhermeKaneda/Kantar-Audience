// Valores padrão dos filtros. Cada página importa isso e mantém
// seu próprio useState — sem contexto global, sem sincronização entre telas.
export const defaultFilters = {
  broadcaster: ["Todos"],
  market: ["Todos"],
  startDate: "2026-07-01",
  endDate: "2026-07-20",
  weekDay: []
};