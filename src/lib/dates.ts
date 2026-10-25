// All dates are local calendar dates stored as "YYYY-MM-DD" strings.
// Weeks run Monday to Sunday.

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** The Monday of the week containing `iso`. */
export function mondayOf(iso: string): string {
  const d = fromIso(iso);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return toIso(d);
}

export function today(): string {
  return toIso(new Date());
}

/** The 7 dates of the week starting on `monday`. */
export function weekDates(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatShort(iso: string): string {
  return fromIso(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
