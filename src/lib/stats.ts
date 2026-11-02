import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import type { AppData, Category, Session } from "../types";
import { addDays, fromIso, mondayOf, toIso } from "./dates";
import { findActivity } from "./activities";
import { weekSummary, allTargetsMet } from "./targets";

export interface WeekResult {
  monday: string;
  /** Every non-optional target met. */
  met: boolean;
  /** Share of required sessions done, 0–1. Extra sessions in one category don't make up for another. */
  completion: number;
}

const RUN_CATEGORIES: Category[] = ["easy", "spice"];

/** Results for every week from the first week with a session up to the week containing `today`. */
export function weekResults(data: AppData, today: string): WeekResult[] {
  if (data.sessions.length === 0) return [];
  const first = mondayOf(data.sessions.reduce((min, s) => (s.date < min ? s.date : min), data.sessions[0].date));
  const last = mondayOf(today);
  const out: WeekResult[] = [];
  const targets = data.settings.targets;
  for (let monday = first; monday <= last; monday = addDays(monday, 7)) {
    const summary = weekSummary(data.sessions, monday, targets);
    const required = summary.filter((l) => !CATEGORIES[l.category].optional);
    const wanted = required.reduce((n, l) => n + l.target, 0);
    const got = required.reduce((n, l) => n + Math.min(l.done, l.target), 0);
    out.push({ monday, met: allTargetsMet(summary), completion: wanted === 0 ? 1 : got / wanted });
  }
  return out;
}

export interface Streaks {
  current: number;
  longest: number;
}

/**
 * Streaks of consecutive weeks with every target met. The current week counts
 * once it is met; until then it doesn't break the streak.
 */
export function streaks(weeks: WeekResult[]): Streaks {
  let longest = 0;
  let run = 0;
  for (const w of weeks) {
    run = w.met ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  const lastIndex = weeks.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    if (weeks[i].met) current++;
    else if (i === lastIndex) continue; // this week is still in progress
    else break;
  }
  return { current, longest };
}

export interface CompletionRate {
  /** How many full weeks were counted (fewer than asked for if you're newer than that). */
  weeks: number;
  weeksMet: number;
  /** Average completion over those weeks, 0–1. */
  rate: number;
}

/** Completion over the last `n` full weeks, not counting the week in progress. */
export function completionRate(weeks: WeekResult[], n: number): CompletionRate | null {
  const full = weeks.slice(0, -1).slice(-n);
  if (full.length === 0) return null;
  return {
    weeks: full.length,
    weeksMet: full.filter((w) => w.met).length,
    rate: full.reduce((sum, w) => sum + w.completion, 0) / full.length,
  };
}

const doneRuns = (sessions: Session[]) =>
  sessions.filter((s) => s.done && RUN_CATEGORIES.includes(s.snapshot.category) && s.log?.distanceKm);

export interface Bucket {
  /** Start date of the period, YYYY-MM-DD. */
  start: string;
  label: string;
  value: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Logged running km for each of the last `count` weeks, oldest first, ending with this week. */
export function kmByWeek(sessions: Session[], today: string, count = 12): Bucket[] {
  const runs = doneRuns(sessions);
  const thisMonday = mondayOf(today);
  return Array.from({ length: count }, (_, i) => {
    const start = addDays(thisMonday, -7 * (count - 1 - i));
    const end = addDays(start, 6);
    const km = runs.filter((s) => s.date >= start && s.date <= end).reduce((n, s) => n + s.log!.distanceKm!, 0);
    return { start, label: fromIso(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: round1(km) };
  });
}

/** Logged running km for each of the last `count` calendar months, oldest first, ending with this month. */
export function kmByMonth(sessions: Session[], today: string, count = 12): Bucket[] {
  const runs = doneRuns(sessions);
  const t = fromIso(today);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(t.getFullYear(), t.getMonth() - (count - 1 - i), 1);
    const start = toIso(d);
    const prefix = start.slice(0, 7);
    const km = runs.filter((s) => s.date.startsWith(prefix)).reduce((n, s) => n + s.log!.distanceKm!, 0);
    return { start, label: d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), value: round1(km) };
  });
}

export function totalKm(sessions: Session[]): number {
  return round1(doneRuns(sessions).reduce((n, s) => n + s.log!.distanceKm!, 0));
}

export function countByCategory(sessions: Session[]): { category: Category; count: number }[] {
  const done = sessions.filter((s) => s.done);
  return CATEGORY_ORDER.map((category) => ({ category, count: done.filter((s) => s.snapshot.category === category).length }));
}

export interface ActivityCount {
  activityId: string;
  title: string;
  category: Category;
  count: number;
}

/** Done sessions per activity, most first. Titles come from the library where possible, else the session's snapshot. */
export function countByActivity(data: AppData): ActivityCount[] {
  const map = new Map<string, ActivityCount>();
  for (const s of data.sessions) {
    if (!s.done) continue;
    const hit = map.get(s.activityId);
    if (hit) hit.count++;
    else {
      const a = findActivity(data, s.activityId);
      map.set(s.activityId, {
        activityId: s.activityId,
        title: a?.title ?? s.snapshot.title,
        category: a?.category ?? s.snapshot.category,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}

export interface ExercisePoint {
  date: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
}

export interface ExerciseHistory {
  name: string;
  points: ExercisePoint[];
}

/** Logged sets, reps and weight per exercise over time. Exercises with the most recent entry come first. */
export function strengthProgress(sessions: Session[]): ExerciseHistory[] {
  const map = new Map<string, ExerciseHistory>();
  const sorted = sessions.filter((s) => s.done && s.log?.exercises?.length).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  for (const s of sorted) {
    for (const e of s.log!.exercises!) {
      const key = e.name.trim().toLowerCase();
      if (!key) continue;
      const h = map.get(key) ?? { name: e.name.trim(), points: [] };
      h.name = e.name.trim(); // latest spelling wins
      h.points.push({ date: s.date, sets: e.sets, reps: e.reps, weightKg: e.weightKg });
      map.set(key, h);
    }
  }
  return [...map.values()].sort((a, b) => {
    const la = a.points[a.points.length - 1].date;
    const lb = b.points[b.points.length - 1].date;
    return la < lb ? 1 : la > lb ? -1 : a.name.localeCompare(b.name);
  });
}
