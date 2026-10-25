import type { Session } from "../types";
import { addDays } from "./dates";

export const LEGS_BEFORE_SPICE = "Leg session the day before a spice run. Consider moving one.";

/**
 * Dates that have a leg-heavy strength session followed the next day by a spice run.
 * Works across week boundaries (Sunday legs, Monday spice).
 */
export function legsBeforeSpiceDates(sessions: Session[]): Set<string> {
  const spiceDates = new Set(sessions.filter((s) => s.snapshot.category === "spice").map((s) => s.date));
  const out = new Set<string>();
  for (const s of sessions) {
    if (s.snapshot.legs && spiceDates.has(addDays(s.date, 1))) out.add(s.date);
  }
  return out;
}
