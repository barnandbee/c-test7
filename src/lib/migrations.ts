import { CATEGORIES, CATEGORY_ORDER } from "../data/categories";
import type { AppData, Category, PaceSettings } from "../types";

export const CURRENT_VERSION = 3;

/**
 * Each entry upgrades data from version N to N + 1.
 * When the data shape changes: bump CURRENT_VERSION, add a migration here,
 * and add a test in storage.test.ts. Never edit an existing migration.
 */
const MIGRATIONS: Record<number, (data: any) => any> = {
  // v2 adds custom activities, favourites, session logs and paces.
  1: (d) => ({
    ...d,
    version: 2,
    customActivities: [],
    settings: { ...d.settings, favourites: [], paces: {} },
  }),
  // v3 lets an activity show several paces: `pace: "tempo"` becomes `paces: ["tempo"]`.
  2: (d) => ({
    ...d,
    version: 3,
    customActivities: (d.customActivities ?? []).map(({ pace, ...a }: any) => (pace ? { ...a, paces: [pace] } : a)),
  }),
};

const ZONES = ["race", "tempo", "long", "easy", "recovery"];

export function defaultTargets(): Record<Category, number> {
  return Object.fromEntries(CATEGORY_ORDER.map((c) => [c, CATEGORIES[c].defaultTarget])) as Record<Category, number>;
}

export function emptyData(): AppData {
  return {
    version: CURRENT_VERSION,
    sessions: [],
    customActivities: [],
    settings: { targets: defaultTargets(), favourites: [], paces: {} },
  };
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

const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const isRange = (r: unknown): r is [number, number] => Array.isArray(r) && r.length === 2 && r.every((n) => isNum(n) && n > 0);

function normalisePaces(p: any): PaceSettings {
  const out: PaceSettings = {};
  if (!p || typeof p !== "object") return out;
  if (isNum(p.fiveK) && p.fiveK > 0) out.fiveK = p.fiveK;
  if (isNum(p.tenK) && p.tenK > 0) out.tenK = p.tenK;
  if (isRange(p.easyOverride)) out.easyOverride = p.easyOverride;
  if (isRange(p.tempoOverride)) out.tempoOverride = p.tempoOverride;
  if (typeof p.updated === "string") out.updated = p.updated;
  return out;
}

/** Fill in any missing fields with defaults so the rest of the app can trust the shape. */
function normalise(data: any): AppData {
  const targets = defaultTargets();
  const stored = data.settings?.targets ?? {};
  for (const c of CATEGORY_ORDER) {
    const n = stored[c];
    if (isNum(n) && n >= 0) targets[c] = Math.floor(n);
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
  const customActivities = Array.isArray(data.customActivities)
    ? data.customActivities
        .filter((a: any) => a && typeof a.id === "string" && typeof a.title === "string" && CATEGORY_ORDER.includes(a.category))
        .map((a: any) => {
          const out = { ...a, custom: true, short: a.short || a.title, duration: a.duration ?? "", description: a.description ?? "" };
          const paces = Array.isArray(a.paces) ? a.paces.filter((z: unknown) => ZONES.includes(z as string)) : [];
          if (paces.length) out.paces = paces;
          else delete out.paces;
          return out;
        })
    : [];
  const favourites = Array.isArray(data.settings?.favourites)
    ? data.settings.favourites.filter((f: unknown) => typeof f === "string")
    : [];
  return {
    version: CURRENT_VERSION,
    sessions: sessions.map((s: any) => ({ ...s, done: Boolean(s.done) })),
    customActivities,
    settings: { targets, favourites, paces: normalisePaces(data.settings?.paces) },
  };
}
