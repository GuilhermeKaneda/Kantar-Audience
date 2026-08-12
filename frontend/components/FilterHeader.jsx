"use client";

import MultiSelect from "@/components/MultiSelect";

export default function FilterHeader({ filters, onChange, markets = [], broadcasters = [] }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <header className="filter-header">
      <MultiSelect
        label="Emissora"
        options={broadcasters}
        selected={filters.broadcaster}
        onChange={(value) => update("broadcaster", value)}
      />

      <MultiSelect
        label="Praça"
        options={markets}
        selected={filters.market}
        onChange={(value) => update("market", value)}
      />

      <div className="filter-field">
        <label>Data Inicial</label>
        <input type="date" value={filters.startDate} onChange={(e) => update("startDate", e.target.value)} />
      </div>

      <div className="filter-field">
        <label>Data Final</label>
        <input type="date" value={filters.endDate} onChange={(e) => update("endDate", e.target.value)} />
      </div>

    </header>
  );
}