import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import type { AppData, Category, Session } from "../types";
import { addDays } from "./dates";
import { sessionsBetween } from "./sessions";

export interface LaneSummary {
  category: Category;
  target: number;
  done: number;
  planned: number;
  met: boolean;
  note?: string;
}

/** Progress per category for the week starting on `monday`. */
export function weekSummary(
  sessions: Session[],
  monday: string,
  targets: Record<Category, number>,
): LaneSummary[] {
  const week = sessionsBetween(sessions, monday, addDays(monday, 6));
  return CATEGORY_ORDER.map((category) => {
    const items = week.filter((s) => s.snapshot.category === category);
    const done = items.filter((s) => s.done).length;
    const target = targets[category];
    let note: string | undefined;
    if (category === "spice" && items.length > 1) {
      note = "One spice run a week is enough. Consider swapping one for an easy run.";
    }
    if (category === "mobility" && done >= 1 && !items.some((s) => s.done && s.snapshot.neck)) {
      note = "Make one of these the neck and shoulders session.";
    }
    return { category, target, done, planned: items.length - done, met: done >= target, note };
  });
}

/** True when every non-optional category met its target that week. */
export function allTargetsMet(summary: LaneSummary[]): boolean {
  return summary.every((l) => CATEGORIES[l.category].optional || l.met);
}

export function setTarget(data: AppData, category: Category, value: number): AppData {
  const n = Math.max(0, Math.min(14, Math.floor(value)));
  return { ...data, settings: { ...data.settings, targets: { ...data.settings.targets, [category]: n } } };
}
