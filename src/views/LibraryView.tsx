import { useState } from "preact/hooks";
import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import { MORE_VIDEOS } from "../data/library";
import { allActivities, blankActivity, duplicateActivity, toggleFavourite } from "../lib/activities";
import { computePaces } from "../lib/paces";
import { formatShort } from "../lib/dates";
import type { Activity, AppData, Category, CustomActivity } from "../types";
import type { Update } from "../app";
import { ActivityCard } from "../components/ActivityCard";

type Filter = "all" | "favourites" | "runs" | "strength" | "mobility" | "bonus" | "custom";

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["favourites", "★ Favourites"],
  ["runs", "Runs"],
  ["strength", "Strength"],
  ["mobility", "Mobility"],
  ["bonus", "Bonus"],
  ["custom", "Mine"],
];

function inCategoryFilter(filter: Filter, cat: Category): boolean {
  if (filter === "runs") return cat === "easy" || cat === "spice";
  if (filter === "strength" || filter === "mobility" || filter === "bonus") return filter === cat;
  return true;
}

interface Props {
  data: AppData;
  monday: string;
  update: Update;
  onAdd: (a: Activity, dayIndex: number) => void;
  onEdit: (a: CustomActivity, isNew: boolean) => void;
}

export function LibraryView({ data, monday, update, onAdd, onEdit }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const favs = new Set(data.settings.favourites);
  const paces = computePaces(data.settings.paces);
  const activities = allActivities(data).filter(
    (a) => (filter !== "favourites" || favs.has(a.id)) && (filter !== "custom" || "custom" in a),
  );
  const groups = CATEGORY_ORDER.filter((c) => inCategoryFilter(filter, c))
    .map((cat) => ({ cat, items: activities.filter((a) => a.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <div class="lib-head">
        <p class="muted">Adding to the week of {formatShort(monday)}.</p>
        <button type="button" class="btn" onClick={() => onEdit(blankActivity(), true)}>
          + New activity
        </button>
      </div>
      <div class="filters" role="group" aria-label="Filter library">
        {FILTERS.map(([key, label]) => (
          <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      {groups.length === 0 && (
        <p class="empty-state">
          {filter === "favourites"
            ? "No favourites yet. Tap the star on any activity to add it here."
            : "You haven’t made any activities yet. Tap “New activity”, or open any activity and tap “Duplicate” to start from a copy."}
        </p>
      )}
      {groups.map(({ cat, items }) => (
        <section key={cat} style={{ "--c": `var(--${cat})` }} aria-labelledby={`group-${cat}`}>
          <h3 class="group-title" id={`group-${cat}`}>
            {CATEGORIES[cat].label}
          </h3>
          {items.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              favourite={favs.has(a.id)}
              paces={paces}
              onToggleFavourite={() => update((d) => toggleFavourite(d, a.id))}
              onAdd={onAdd}
              onDuplicate={() => onEdit(duplicateActivity(a), true)}
              onEdit={"custom" in a ? () => onEdit(a as CustomActivity, false) : undefined}
            />
          ))}
        </section>
      ))}
      <p class="foot">
        Follow-along videos:{" "}
        <a href={MORE_VIDEOS[0].url} target="_blank" rel="noopener">
          {MORE_VIDEOS[0].label}
        </a>{" "}
        and{" "}
        <a href={MORE_VIDEOS[1].url} target="_blank" rel="noopener">
          {MORE_VIDEOS[1].label}
        </a>{" "}
        both have plenty more once you’ve worked through these.
      </p>
    </>
  );
}
