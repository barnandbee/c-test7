// Calendar files (RFC 5545) for adding a planned session to a phone calendar.
import { addDays } from "./dates";

/** Escape text for an iCalendar property value. */
export function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold a content line to at most 75 octets per line, as the spec requires. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (enc.encode(current + ch).length > limit) {
      out.push(current);
      current = ch;
    } else current += ch;
  }
  out.push(current);
  return out.join("\r\n ");
}

/** Minutes from a duration like "30–35 min" (takes the upper end), "~15 min" or "45+ min". */
export function minutesFromDuration(text: string, fallback = 30): number {
  const nums = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (nums.length === 0) return fallback;
  const n = Math.max(...nums);
  return /\b(h|hr|hrs|hour|hours)\b/i.test(text) ? Math.round(n * 60) : Math.round(n);
}

const pad = (n: number) => String(n).padStart(2, "0");
const compactDate = (iso: string) => iso.replace(/-/g, "");

function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Local date-time a number of minutes after `date` at `time` ("HH:MM"), crossing midnight if needed. */
export function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const days = Math.floor(total / 1440);
  const rest = ((total % 1440) + 1440) % 1440;
  return { date: addDays(date, days), time: `${pad(Math.floor(rest / 60))}:${pad(rest % 60)}` };
}

export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  /** "HH:MM" local time; leave out for an all-day event. */
  time?: string;
  durationMin: number;
  url?: string;
  /** For tests. */
  now?: Date;
}

/** A complete .ics file for one event. Timed events use floating local time, so they follow the phone's time zone. */
export function buildIcs(e: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bass Moultapps//Training week//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${utcStamp(e.now ?? new Date())}`,
  ];
  if (e.time) {
    const end = addMinutes(e.date, e.time, e.durationMin);
    lines.push(`DTSTART:${compactDate(e.date)}T${e.time.replace(":", "")}00`);
    lines.push(`DTEND:${compactDate(end.date)}T${end.time.replace(":", "")}00`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compactDate(e.date)}`);
    lines.push(`DTEND;VALUE=DATE:${compactDate(addDays(e.date, 1))}`);
  }
  lines.push(`SUMMARY:${escapeText(e.title)}`);
  if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
  if (e.url) lines.push(`URL:${e.url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** A safe file name, e.g. "easy-5km-2026-11-04.ics". */
export function icsFileName(title: string, date: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "session"}-${date}.ics`;
}
