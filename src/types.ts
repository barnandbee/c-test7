export type Category = "easy" | "spice" | "strength" | "mobility" | "bonus";

export interface Link {
  label: string;
  url: string;
}

export interface Exercise {
  name: string;
  /** Sets, reps and weight as free text, e.g. "10 reps · 5kg". */
  dose: string;
  howTo: string;
}

export interface Activity {
  id: string;
  category: Category;
  title: string;
  /** Short name used on diary chips. */
  short: string;
  /** Free text, e.g. "30–35 min". */
  duration: string;
  description: string;
  steps?: string[];
  links?: Link[];
  exercises?: Exercise[];
  /** Leg-heavy session: triggers the "day before a spice run" warning. */
  legs?: boolean;
  /** Counts as the weekly neck and shoulders mobility session. */
  neck?: boolean;
}

/** What a session remembers about its activity, so history survives library edits. */
export interface ActivitySnapshot {
  title: string;
  short: string;
  category: Category;
  legs?: boolean;
  neck?: boolean;
}

export interface Session {
  id: string;
  activityId: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  done: boolean;
  snapshot: ActivitySnapshot;
}

export interface Settings {
  targets: Record<Category, number>;
}

export interface AppData {
  version: number;
  sessions: Session[];
  settings: Settings;
}
