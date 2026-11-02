export type Category = "easy" | "spice" | "strength" | "mobility" | "bonus";

/** Which of your training paces a run activity uses. */
export type PaceZone = "easy" | "recovery" | "long" | "tempo" | "race";

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
  /** Which of your paces to show on the card, e.g. ["tempo", "easy"]. */
  paces?: PaceZone[];
}

/** An activity you created. Deleted ones are kept (hidden) so past sessions still resolve. */
export interface CustomActivity extends Activity {
  custom: true;
  deleted?: boolean;
}

/** What a session remembers about its activity, so history survives library edits. */
export interface ActivitySnapshot {
  title: string;
  short: string;
  category: Category;
  legs?: boolean;
  neck?: boolean;
}

export interface ExerciseLog {
  name: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
}

export interface SessionLog {
  distanceKm?: number;
  durationMin?: number;
  /** 1–10 */
  effort?: number;
  weightKg?: number;
  note?: string;
  exercises?: ExerciseLog[];
}

export interface Session {
  id: string;
  activityId: string;
  /** Local date, YYYY-MM-DD. */
  date: string;
  done: boolean;
  snapshot: ActivitySnapshot;
  log?: SessionLog;
}

/** Times in seconds. Ranges are seconds per km, [faster, slower]. */
export interface PaceSettings {
  fiveK?: number;
  tenK?: number;
  easyOverride?: [number, number];
  tempoOverride?: [number, number];
  /** Local date the race times were last changed. */
  updated?: string;
}

export interface Settings {
  targets: Record<Category, number>;
  favourites: string[];
  paces: PaceSettings;
}

export interface AppData {
  version: number;
  sessions: Session[];
  customActivities: CustomActivity[];
  settings: Settings;
}
