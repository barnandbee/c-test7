import type { PaceSettings, PaceZone } from "../types";

/**
 * Parse "22:45", "22.45" or "1:02:30" into seconds. Accepts ":" or "." as the
 * separator so it can be typed on a phone's number pad. Returns null if invalid.
 */
export function parseTime(input: string): number | null {
  const parts = input.trim().split(/[:.]/);
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((p) => /^\d+$/.test(p))) return null;
  // Every part after the first must be exactly two digits, 00–59.
  if (parts.slice(1).some((p) => p.length !== 2 || Number(p) > 59)) return null;
  const total = parts.reduce((acc, p) => acc * 60 + Number(p), 0);
  return total > 0 ? total : null;
}

/** 1365 -> "22:45", 3750 -> "1:02:30" */
export function formatTime(seconds: number): string {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function formatRange([a, b]: [number, number]): string {
  return `${formatTime(a)}–${formatTime(b)}`;
}

/** Riegel's formula: predicted time for a new distance from a known one. */
export function riegel(time: number, fromKm: number, toKm: number): number {
  return time * Math.pow(toKm / fromKm, 1.06);
}

export interface Paces {
  /** 5km race pace, seconds per km. */
  race: number;
  /** 10km race pace, seconds per km. */
  tenK: number;
  tenKTime: number;
  tenKPredicted: boolean;
  tempo: [number, number];
  tempoCustom: boolean;
  easy: [number, number];
  easyCustom: boolean;
  long: [number, number];
  recovery: [number, number];
}

export const KM_PER_MILE = 1.609344;
/** Tempo is normally 25–30 seconds per mile slower than 5km pace. */
export const TEMPO_SECONDS_PER_MILE: [number, number] = [25, 30];
/** Easy runs, as multiples of 5km race pace. A 22:45 5km (4:33/km) gives 5:41–6:00/km. */
export const EASY_FACTORS: [number, number] = [1.25, 1.32];
/** Long runs: 45 seconds to 1:30 per km slower than 5km pace (Runner’s World). */
export const LONG_SECONDS_PER_KM: [number, number] = [45, 90];
/** Recovery runs: from the slow end of easy to this many seconds per km slower. */
export const RECOVERY_EXTRA = 30;

const scale = (pace: number, [a, b]: [number, number]): [number, number] => [Math.round(pace * a), Math.round(pace * b)];
const plus = (pace: number, [a, b]: [number, number]): [number, number] => [Math.round(pace + a), Math.round(pace + b)];

/** Training paces from your 5km time, or null if no 5km time is set. */
export function computePaces(p: PaceSettings): Paces | null {
  if (!p.fiveK) return null;
  const exact = p.fiveK / 5;
  const tenKTime = p.tenK ?? Math.round(riegel(p.fiveK, 5, 10));
  const easy = p.easyOverride ?? scale(exact, EASY_FACTORS);
  const tempoPerKm = TEMPO_SECONDS_PER_MILE.map((s) => s / KM_PER_MILE) as [number, number];
  return {
    race: Math.round(exact),
    tenK: Math.round(tenKTime / 10),
    tenKTime,
    tenKPredicted: !p.tenK,
    tempo: p.tempoOverride ?? plus(exact, tempoPerKm),
    tempoCustom: Boolean(p.tempoOverride),
    easy,
    easyCustom: Boolean(p.easyOverride),
    long: plus(exact, LONG_SECONDS_PER_KM),
    recovery: [easy[1], easy[1] + RECOVERY_EXTRA],
  };
}

/** Display order: the main effort first, warm-up paces last. */
export const ZONE_ORDER: PaceZone[] = ["race", "tempo", "long", "easy", "recovery"];

export const ZONE_LABELS: Record<PaceZone, string> = {
  race: "5km race pace",
  tempo: "Tempo pace",
  long: "Long run pace",
  easy: "Easy pace",
  recovery: "Recovery pace",
};

/** Short pace text for a zone, e.g. "5:41–6:00 /km" or "4:33 /km". */
export function zoneValue(paces: Paces, zone: PaceZone): string {
  if (zone === "race") return `${formatTime(paces.race)} /km`;
  return `${formatRange(paces[zone])} /km`;
}

export interface PaceLine {
  zone: PaceZone;
  label: string;
  value: string;
}

/**
 * The pace lines for an activity, in the order the activity lists them (main
 * effort first). In a hard session (a harder pace alongside, or any spice run,
 * such as hills run by effort) easy pace is the warm-up and cool-down pace, and
 * goes last.
 */
export function paceLines(paces: Paces, zones: PaceZone[], hardSession = false): PaceLine[] {
  const unique = zones.filter((z, i) => ZONE_ORDER.includes(z) && zones.indexOf(z) === i);
  const hasHarder = hardSession || unique.some((z) => z === "race" || z === "tempo");
  const ordered = hasHarder ? [...unique.filter((z) => z !== "easy"), ...unique.filter((z) => z === "easy")] : unique;
  return ordered.map((zone) => ({
    zone,
    label: zone === "easy" && hasHarder ? "Warm-up and cool-down" : ZONE_LABELS[zone],
    value: zoneValue(paces, zone),
  }));
}
