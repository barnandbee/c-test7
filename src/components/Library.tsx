import { useState } from "preact/hooks";
import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import { LIBRARY } from "../data/library";
import type { Activity, Category } from "../types";
import { ActivityCard } from "./ActivityCard";

type Filter = "all" | "runs" | "strength" | "mobility" | "bonus";

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["runs", "Runs"],
  ["strength", "Strength"],
  ["mobility", "Mobility"],
  ["bonus", "Bonus"],
];

function matches(filter: Filter, cat: Category): boolean {
  if (filter === "all") return true;
  if (filter === "runs") return cat === "easy" || cat === "spice";
  return filter === cat;
}

export function Library({ onAdd }: { onAdd: (a: Activity, dayIndex: number) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  return (
    <>
      <div class="filters" role="group" aria-label="Filter library">
        {FILTERS.map(([key, label]) => (
          <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      {CATEGORY_ORDER.filter((c) => matches(filter, c)).map((cat) => (
        <section key={cat} style={{ "--c": `var(--${cat})` }} aria-labelledby={`group-${cat}`}>
          <h3 class="group-title" id={`group-${cat}`}>
            {CATEGORIES[cat].label}
          </h3>
          {LIBRARY.filter((a) => a.category === cat).map((a) => (
            <ActivityCard key={a.id} activity={a} onAdd={onAdd} />
          ))}
        </section>
      ))}
    </>
  );
}
