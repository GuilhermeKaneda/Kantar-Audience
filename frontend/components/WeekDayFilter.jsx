"use client";

export default function WeekDayFilter({ weekDays = [], selected = [], onChange }) {
    function toggleDay(day) {
        const isSelected = selected.includes(day);
        onChange(isSelected ? selected.filter((d) => d !== day) : [...selected, day]);
    }

    return (
        <>
            <span className="weekday-filter-label">FILTRAR POR DIA DA SEMANA</span>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {weekDays.map((day) => (
                    <button
                        key={day}
                        type="button"
                        className={`weekday-pill ${selected.includes(day) ? "active" : ""}`}
                        onClick={() => toggleDay(day)}
                        aria-pressed={selected.includes(day)}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </>
    );
}