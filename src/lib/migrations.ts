import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import type { AppData, Category } from "../types";

export const CURRENT_VERSION = 1;

/**
 * Each entry upgrades data from version N to N + 1.
 * When the data shape changes: bump CURRENT_VERSION, add a migration here,
 * and add a test in migrations.test.ts. Never edit an existing migration.
 */
const MIGRATIONS: Record<number, (data: any) => any> = {
  // 1: (d) => ({ ...d, version: 2, ... }),
};

export function defaultTargets(): Record<Category, number> {
  return Object.fromEntries(CATEGORY_ORDER.map((c) => [c, CATEGORIES[c].defaultTarget])) as Record<Category, number>;
}

export function emptyData(): AppData {
  return { version: CURRENT_VERSION, sessions: [], settings: { targets: defaultTargets() } };
}

export class DataVersionError extends Error {}

/** Upgrade any stored or imported data to the current shape. Throws on unusable input. */
export function migrate(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") throw new Error("Not a data object");
  let data: any = raw;
  let version = typeof data.version === "number" ? data.version : NaN;
  if (!Number.isInteger(version) || version < 1) throw new Error("Missing or invalid version");
  if (version > CURRENT_VERSION) {
    throw new DataVersionError(`This data is from a newer version of the app (v${version}).`);
  }
  while (version < CURRENT_VERSION) {
    data = MIGRATIONS[version](data);
    version = data.version;
  }
  return normalise(data);
}

/** Fill in any missing fields with defaults so the rest of the app can trust the shape. */
function normalise(data: any): AppData {
  const targets = defaultTargets();
  const stored = data.settings?.targets ?? {};
  for (const c of CATEGORY_ORDER) {
    const n = stored[c];
    if (typeof n === "number" && Number.isFinite(n) && n >= 0) targets[c] = Math.floor(n);
  }
  const sessions = Array.isArray(data.sessions)
    ? data.sessions.filter(
        (s: any) =>
          s &&
          typeof s.id === "string" &&
          typeof s.activityId === "string" &&
          typeof s.date === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
          s.snapshot &&
          CATEGORY_ORDER.includes(s.snapshot.category),
      )
    : [];
  return {
    version: CURRENT_VERSION,
    sessions: sessions.map((s: any) => ({ ...s, done: Boolean(s.done) })),
    settings: { ...data.settings, targets },
  };
}
