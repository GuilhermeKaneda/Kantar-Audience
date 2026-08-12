"use client";

import { useState, useRef, useEffect } from "react";

export default function MultiSelect({ label, options, selected, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function toggle(value) {
        if (value === "Todos") {
            onChange(["Todos"]);
            return;
        }

        let values = selected.filter((v) => v !== "Todos");

        if (values.includes(value)) {
            values = values.filter((v) => v !== value);
        } else {
            values = [...values, value];
        }

        onChange(values.length ? values : ["Todos"]);
    }

    const summary = (() => {
        if (selected.length === 0 || selected.length === options.length)
            return "Todos";
        if (selected.length === 1)
            return selected[0];
        return `${selected.length - 1} selecionados`;
    })();

    return (
        <div className="filter-field multiselect" ref={ref}>
            <label>{label}</label>

            <button
                type="button"
                className="multiselect-trigger"
                onClick={() => setOpen((o) => !o)}
            >
                {summary}
                <span className="multiselect-arrow">
                    {open ? "▲" : "▼"}
                </span>
            </button>

            {open && (
                <div className="multiselect-panel">
                    {options.map((opt) => {
                        const value = typeof opt === "string" ? opt : opt.nome;

                        return (
                            <label key={value} className="multiselect-option">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(value)}
                                    onChange={() => toggle(value)}
                                />
                                {value}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}