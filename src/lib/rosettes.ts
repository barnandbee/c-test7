import type { AppData, Category, Session } from "../types";
import { streaks, strengthProgress, totalKm, weekResults } from "./stats";

/** What a rosette's colour is drawn from: a category, or the overall award colour. */
export type RosetteColour = Category | "award";

export interface RosetteFacts {
  done: Session[];
  weeksMet: number;
  longestStreak: number;
  totalKm: number;
  longestRunKm: number;
  byCategory: Record<Category, number>;
  /** Done sessions whose title matches, case-insensitive. */
  titled: (word: string) => number;
  neckSessions: number;
  distinctActivities: number;
  /** Exercises where a later logged weight beats the first one. */
  exercisesProgressed: number;
}

export interface RosetteDef {
  id: string;
  name: string;
  description: string;
  /** Short text inside the rosette, up to 4 characters. */
  mark: string;
  colour: RosetteColour;
  goal: number;
  /** Unit for the progress text, e.g. "km" gives "32 of 50 km". */
  unit?: string;
  /** Progress towards the goal. */
  value: (f: RosetteFacts) => number;
}

export interface Rosette extends Omit<RosetteDef, "value"> {
  value: number;
  won: boolean;
}

const RUN_CATEGORIES: Category[] = ["easy", "spice"];

export function rosetteFacts(data: AppData, today: string): RosetteFacts {
  const done = data.sessions.filter((s) => s.done);
  const weeks = weekResults(data, today);
  const byCategory = { easy: 0, spice: 0, strength: 0, mobility: 0, bonus: 0 } as Record<Category, number>;
  for (const s of done) byCategory[s.snapshot.category]++;
  const runs = done.filter((s) => RUN_CATEGORIES.includes(s.snapshot.category));
  return {
    done,
    weeksMet: weeks.filter((w) => w.met).length,
    longestStreak: streaks(weeks).longest,
    totalKm: totalKm(data.sessions),
    longestRunKm: Math.max(0, ...runs.map((s) => s.log?.distanceKm ?? 0)),
    byCategory,
    titled: (word) => done.filter((s) => s.snapshot.title.toLowerCase().includes(word)).length,
    neckSessions: done.filter((s) => s.snapshot.neck).length,
    distinctActivities: new Set(done.map((s) => s.activityId)).size,
    exercisesProgressed: strengthProgress(data.sessions).filter((e) => {
      const weights = e.points.map((p) => p.weightKg).filter((w): w is number => w !== undefined);
      return weights.length > 1 && Math.max(...weights.slice(1)) > weights[0];
    }).length,
  };
}

/** Work out every rosette's progress. Definitions live in src/data/rosettes.ts. */
export function evaluateRosettes(defs: RosetteDef[], facts: RosetteFacts): Rosette[] {
  return defs.map(({ value, ...def }) => {
    const v = Math.min(def.goal, value(facts));
    return { ...def, value: v, won: v >= def.goal };
  });
}
