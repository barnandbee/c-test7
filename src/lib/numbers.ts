import { parseTime } from "./paces";

/** Parse a number typed on a phone, accepting "5,2" as well as "5.2". Blank, zero or invalid gives undefined. */
export function parseNumber(text: string): number | undefined {
  const t = text.trim().replace(",", ".");
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Minutes from "29", "29.5" or "29:30". */
export function parseMinutes(text: string): number | undefined {
  if (text.includes(":")) {
    const t = parseTime(text);
    return t === null ? undefined : Math.round((t / 60) * 100) / 100;
  }
  return parseNumber(text);
}
