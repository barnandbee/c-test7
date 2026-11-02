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
  recovery: [number, number];
}

// Multipliers of 5km race pace. A 22:45 5km (4:33/km) gives
// tempo 4:49–4:58/km and easy 5:41–6:00/km.
export const TEMPO_FACTORS: [number, number] = [1.06, 1.09];
export const EASY_FACTORS: [number, number] = [1.25, 1.32];
/** Recovery runs: from the slow end of easy to this many seconds per km slower. */
export const RECOVERY_EXTRA = 30;

const scale = (pace: number, [a, b]: [number, number]): [number, number] => [Math.round(pace * a), Math.round(pace * b)];

/** Training paces from your 5km time, or null if no 5km time is set. */
export function computePaces(p: PaceSettings): Paces | null {
  if (!p.fiveK) return null;
  const race = Math.round(p.fiveK / 5);
  const tenKTime = p.tenK ?? Math.round(riegel(p.fiveK, 5, 10));
  const easy = p.easyOverride ?? scale(p.fiveK / 5, EASY_FACTORS);
  return {
    race,
    tenK: Math.round(tenKTime / 10),
    tenKTime,
    tenKPredicted: !p.tenK,
    tempo: p.tempoOverride ?? scale(p.fiveK / 5, TEMPO_FACTORS),
    tempoCustom: Boolean(p.tempoOverride),
    easy,
    easyCustom: Boolean(p.easyOverride),
    recovery: [easy[1], easy[1] + RECOVERY_EXTRA],
  };
}

export const ZONE_LABELS: Record<PaceZone, string> = {
  race: "5km race pace",
  tempo: "Tempo pace",
  easy: "Easy pace",
  recovery: "Recovery pace",
};

/** The pace text for an activity card, e.g. "Easy pace: 5:41–6:00 /km". */
export function paceForZone(paces: Paces, zone: PaceZone): string {
  const value =
    zone === "race"
      ? `around ${formatTime(paces.race)}`
      : formatRange(zone === "tempo" ? paces.tempo : zone === "recovery" ? paces.recovery : paces.easy);
  return `${ZONE_LABELS[zone]}: ${value} /km`;
}
