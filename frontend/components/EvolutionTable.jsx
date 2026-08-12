"use client";

import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

function formatNumber(value, share) {
    if (value == null) 
        return "-";

    if (share)
        return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "%";

    return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function sortRows(rows, rowKey, sortKey, sortDir) {
    const sorted = [...rows];

    if (!sortKey) {
        return sorted.sort((a, b) =>
            a[rowKey].localeCompare(b[rowKey])
        );
    }

    return sorted.sort((a, b) => {
        const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
        return sortDir === "asc" ? diff : -diff;
    });
}

export default function EvolutionTable({ rows, rowKey, columns, share = false }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("desc");
    const [page, setPage] = useState(0);

    const sorted = useMemo(
        () => sortRows(rows, rowKey.key, sortKey, sortDir),
        [rows, rowKey.key, sortKey, sortDir]
    );

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paged = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    function toggleSort(key) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
        setPage(0);
    }
    return (
        <div>
            <table className="audience-table">
                <thead>
                    <tr>
                        <th className="th-row-label">{rowKey.label}</th>
                        {columns.map((col) => (
                            <th key={col.key} style={{ color: col.cor }} className="th-sortable" onClick={() => toggleSort(col.key)}>
                                {col.label.toUpperCase()} <span className="sort-icon">⇅</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paged.map((row) => {
                        const maxCol = columns.reduce((max, col) =>
                            (row[col.key] ?? 0) > (row[max?.key] ?? -Infinity) ? col : max, null
                        );

                        return (
                            <tr key={row[rowKey.key]}>
                                <td className="td-row-label">{row[rowKey.key]}</td>
                                {columns.map((col) => (
                                    <td
                                        key={col.key}                                    >
                                        {formatNumber(row[col.key], share)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="table-pagination">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
                <span>{page + 1} / {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
        </div>
    );
}