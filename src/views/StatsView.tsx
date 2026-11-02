import { useState } from "preact/hooks";
import { CATEGORIES } from "../data/categories";
import { findActivity } from "../lib/activities";
import { formatShort, fromIso, today } from "../lib/dates";
import {
  completionRate,
  countByActivity,
  countByCategory,
  kmByMonth,
  kmByWeek,
  strengthProgress,
  streaks,
  totalKm,
  weekResults,
} from "../lib/stats";
import type { AppData } from "../types";
import { ChartTable, ColumnChart, LineChart, StatTile } from "../components/Charts";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const km = (n: number) => `${n.toLocaleString("en-GB", { maximumFractionDigits: 1 })} km`;
const weeksText = (n: number) => `${n} ${n === 1 ? "week" : "weeks"}`;

export function StatsView({ data }: { data: AppData }) {
  const now = today();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [showAllActivities, setShowAllActivities] = useState(false);
  const exercises = strengthProgress(data.sessions);
  const [exercise, setExercise] = useState(exercises[0]?.name.toLowerCase() ?? "");

  const done = data.sessions.filter((s) => s.done);
  if (done.length === 0) {
    return (
      <p class="empty-state">
        Nothing to show yet. Mark a few sessions as done and your streaks, distances and progress will appear here.
      </p>
    );
  }

  const weeks = weekResults(data, now);
  const streak = streaks(weeks);
  const rates = [4, 12, 52].map((n) => ({ n, r: completionRate(weeks, n) }));
  const buckets = period === "week" ? kmByWeek(data.sessions, now) : kmByMonth(data.sessions, now);
  const columns = buckets.map((b) => ({
    label: b.label,
    longLabel: period === "week" ? `Week of ${formatShort(b.start)}` : fromIso(b.start).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    value: b.value,
  }));
  const anyKm = buckets.some((b) => b.value > 0);
  const byCategory = countByCategory(data.sessions);
  const maxCat = Math.max(1, ...byCategory.map((c) => c.count));
  const byActivity = countByActivity(data);
  const favourites = data.settings.favourites
    .map((id) => ({ id, a: findActivity(data, id), count: byActivity.find((c) => c.activityId === id)?.count ?? 0 }))
    .filter((f) => f.a);
  const ex = exercises.find((e) => e.name.toLowerCase() === exercise) ?? exercises[0];
  const weightPoints = ex?.points.filter((p) => p.weightKg !== undefined) ?? [];
  const repPoints = ex?.points.filter((p) => p.reps !== undefined) ?? [];

  return (
    <>
      <section aria-labelledby="overview-title">
        <h2 id="overview-title">Overview</h2>
        <div class="tiles">
          <StatTile label="Current streak" value={weeksText(streak.current)} sub="All targets met in a row" />
          <StatTile label="Longest streak" value={weeksText(streak.longest)} />
          <StatTile label="Sessions done" value={done.length.toLocaleString("en-GB")} />
          <StatTile label="Running logged" value={km(totalKm(data.sessions))} />
        </div>
        <p class="muted small">Streaks count weeks where every target except Bonus was met. This week counts once it’s met.</p>
      </section>

      <section aria-labelledby="completion-title">
        <h2 id="completion-title">Weekly completion</h2>
        <div class="rates">
          {rates.map(({ n, r }) => (
            <div class="rate" key={n}>
              <span class="rate-label">Last {n} weeks</span>
              {r ? (
                <>
                  <span class="rate-value">{pct(r.rate)}</span>
                  <span class="meter" aria-hidden="true">
                    <span style={{ width: pct(r.rate) }} />
                  </span>
                  <span class="rate-sub">
                    All targets met in {r.weeksMet} of {weeksText(r.weeks)}
                    {r.weeks < n ? " (all your history so far)" : ""}
                  </span>
                </>
              ) : (
                <span class="rate-sub">Not enough history yet. Check back after your first full week.</span>
              )}
            </div>
          ))}
        </div>
        <p class="muted small">
          Completion is the share of your weekly target sessions done, not counting Bonus or this week. Extra sessions in
          one category don’t make up for another.
        </p>
      </section>

      <section aria-labelledby="km-title">
        <div class="section-head">
          <h2 id="km-title">Running distance</h2>
          <div class="segmented" role="group" aria-label="Group by">
            <button type="button" aria-pressed={period === "week"} onClick={() => setPeriod("week")}>
              Weekly
            </button>
            <button type="button" aria-pressed={period === "month"} onClick={() => setPeriod("month")}>
              Monthly
            </button>
          </div>
        </div>
        {anyKm ? (
          <>
            <p class="muted small">
              Km per {period}, last 12 {period === "week" ? "weeks" : "months"}, from the distances you log on easy and spice
              runs.
            </p>
            <ColumnChart data={columns} unit="km" title={`Running km per ${period}`} />
            <ChartTable
              caption={`Running km per ${period}`}
              head={[period === "week" ? "Week of" : "Month", "Distance"]}
              rows={columns.map((c) => [period === "week" ? formatShort(buckets[columns.indexOf(c)].start) : c.longLabel, km(c.value)])}
            />
          </>
        ) : (
          <p class="empty-state">
            No distances logged in the last 12 {period === "week" ? "weeks" : "months"}. Add the distance when you mark a run
            as done.
          </p>
        )}
      </section>

      <section aria-labelledby="cat-title">
        <h2 id="cat-title">Sessions by category</h2>
        <ul class="hbars">
          {byCategory.map((c) => (
            <li key={c.category} style={{ "--c": `var(--${c.category})` }}>
              <span class="hbar-label">{CATEGORIES[c.category].label}</span>
              <span class="hbar-track" aria-hidden="true">
                {c.count > 0 && <span class="hbar" style={{ width: `${(c.count / maxCat) * 100}%` }} />}
              </span>
              <span class="hbar-value">{c.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="act-title">
        <h2 id="act-title">Sessions by activity</h2>
        <ol class="counts">
          {(showAllActivities ? byActivity : byActivity.slice(0, 8)).map((c) => (
            <li key={c.activityId} style={{ "--c": `var(--${c.category})` }}>
              <span class="count-name">{c.title}</span>
              <span class="count-n">{c.count}</span>
            </li>
          ))}
        </ol>
        {byActivity.length > 8 && (
          <button type="button" class="btn-plain" onClick={() => setShowAllActivities(!showAllActivities)}>
            {showAllActivities ? "Show fewer" : `Show all ${byActivity.length}`}
          </button>
        )}
      </section>

      <section aria-labelledby="strength-title">
        <h2 id="strength-title">Strength progression</h2>
        {ex ? (
          <>
            <label class="field">
              <span>Exercise</span>
              <select value={ex.name.toLowerCase()} onChange={(e) => setExercise(e.currentTarget.value)}>
                {exercises.map((e) => (
                  <option key={e.name} value={e.name.toLowerCase()}>
                    {e.name} ({e.points.length})
                  </option>
                ))}
              </select>
            </label>
            {weightPoints.length > 0 && (
              <div class="chart-block">
                <h3>Weight (kg)</h3>
                <LineChart
                  data={weightPoints.map((p) => ({ label: formatShort(p.date), value: p.weightKg! }))}
                  unit="kg"
                  title={`${ex.name}: weight over time`}
                />
              </div>
            )}
            {repPoints.length > 0 && (
              <div class="chart-block">
                <h3>Reps</h3>
                <LineChart
                  data={repPoints.map((p) => ({ label: formatShort(p.date), value: p.reps! }))}
                  unit="reps"
                  title={`${ex.name}: reps over time`}
                />
              </div>
            )}
            <ChartTable
              caption={`${ex.name} history`}
              head={["Date", "Sets × reps · weight"]}
              rows={[...ex.points].reverse().map((p) => [
                formatShort(p.date),
                [p.sets && p.reps ? `${p.sets} × ${p.reps}` : p.reps ? `${p.reps} reps` : p.sets ? `${p.sets} sets` : "", p.weightKg ? `${p.weightKg} kg` : ""]
                  .filter(Boolean)
                  .join(" · ") || "–",
              ])}
            />
          </>
        ) : (
          <p class="empty-state">Log sets, reps or weight when you finish a strength session and your progress shows here.</p>
        )}
      </section>

      <section aria-labelledby="top-title">
        <h2 id="top-title">Most used</h2>
        <ol class="counts">
          {byActivity.slice(0, 5).map((c) => (
            <li key={c.activityId} style={{ "--c": `var(--${c.category})` }}>
              <span class="count-name">{c.title}</span>
              <span class="count-n">{c.count}</span>
            </li>
          ))}
        </ol>
        <h2>Favourites</h2>
        {favourites.length ? (
          <ul class="counts">
            {favourites.map((f) => (
              <li key={f.id} style={{ "--c": `var(--${f.a!.category})` }}>
                <span class="count-name">★ {f.a!.title}</span>
                <span class="count-n">{f.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p class="muted">No favourites yet. Star activities in the library.</p>
        )}
      </section>
    </>
  );
}
