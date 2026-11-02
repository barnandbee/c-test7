import type { Activity, AppData, ExerciseLog, Session, SessionLog } from "../types";

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function snapshotOf(a: Activity): Session["snapshot"] {
  return {
    title: a.title,
    short: a.short,
    category: a.category,
    ...(a.legs ? { legs: true } : {}),
    ...(a.neck ? { neck: true } : {}),
  };
}

export function addSession(data: AppData, activity: Activity, date: string): AppData {
  const session: Session = { id: newId(), activityId: activity.id, date, done: false, snapshot: snapshotOf(activity) };
  return { ...data, sessions: [...data.sessions, session] };
}

export function setDone(data: AppData, id: string, done: boolean): AppData {
  return { ...data, sessions: data.sessions.map((s) => (s.id === id ? { ...s, done } : s)) };
}

export function removeSession(data: AppData, id: string): AppData {
  return { ...data, sessions: data.sessions.filter((s) => s.id !== id) };
}

/** Mark a session done and store its log. An empty log is not stored. */
export function completeSession(data: AppData, id: string, log: SessionLog): AppData {
  const clean = cleanLog(log);
  return {
    ...data,
    sessions: data.sessions.map((s) => {
      if (s.id !== id) return s;
      const { log: _old, ...rest } = s;
      return clean ? { ...rest, done: true, log: clean } : { ...rest, done: true };
    }),
  };
}

const positive = (n: number | undefined) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : undefined);

/** Drop blank fields. Returns undefined if nothing was recorded. */
export function cleanLog(log: SessionLog): SessionLog | undefined {
  const out: SessionLog = {};
  const distanceKm = positive(log.distanceKm);
  const durationMin = positive(log.durationMin);
  const weightKg = positive(log.weightKg);
  const effort = positive(log.effort);
  if (distanceKm) out.distanceKm = distanceKm;
  if (durationMin) out.durationMin = durationMin;
  if (weightKg) out.weightKg = weightKg;
  if (effort) out.effort = Math.min(10, Math.max(1, Math.round(effort)));
  if (log.note?.trim()) out.note = log.note.trim();
  const exercises = log.exercises
    ?.map((e) => {
      const x: ExerciseLog = { name: e.name };
      if (positive(e.sets)) x.sets = e.sets;
      if (positive(e.reps)) x.reps = e.reps;
      if (positive(e.weightKg)) x.weightKg = e.weightKg;
      return x;
    })
    .filter((e) => e.sets || e.reps || e.weightKg);
  if (exercises?.length) out.exercises = exercises;
  return Object.keys(out).length ? out : undefined;
}

export function sessionsBetween(sessions: Session[], from: string, to: string): Session[] {
  return sessions.filter((s) => s.date >= from && s.date <= to);
}

/** The most recent logged values for an exercise, by name (case-insensitive). */
export function lastExerciseLog(sessions: Session[], name: string, beforeDate?: string): ExerciseLog | undefined {
  const key = name.trim().toLowerCase();
  const sorted = sessions
    .filter((s) => s.done && s.log?.exercises && (!beforeDate || s.date <= beforeDate))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  for (const s of sorted) {
    const hit = s.log!.exercises!.find((e) => e.name.trim().toLowerCase() === key);
    if (hit) return hit;
  }
  return undefined;
}

/** Pull reps and kg out of a dose like "10 reps · 5kg". Anything unclear is left blank. */
export function parseDose(dose: string): { reps?: number; weightKg?: number } {
  const reps = dose.match(/(\d+)\s*(?:reps|per)/i);
  const kg = dose.match(/(\d+(?:\.\d+)?)\s*kg/i);
  return {
    ...(reps ? { reps: Number(reps[1]) } : {}),
    ...(kg ? { weightKg: Number(kg[1]) } : {}),
  };
}

/** Starting rows for the exercise log: your last values, or the plan's numbers. */
export function exerciseLogDefaults(sessions: Session[], activity: Activity | undefined, date: string): ExerciseLog[] {
  return (activity?.exercises ?? []).map((e) => {
    const last = lastExerciseLog(sessions, e.name, date);
    if (last) return { name: e.name, sets: last.sets, reps: last.reps, weightKg: last.weightKg };
    return { name: e.name, ...parseDose(e.dose) };
  });
}

/** Rows for editing an existing exercise log: the activity's exercises first, then anything else that was logged. */
export function mergeExerciseRows(activity: Activity | undefined, logged: ExerciseLog[]): ExerciseLog[] {
  const planned = (activity?.exercises ?? []).map((e) => logged.find((x) => x.name === e.name) ?? { name: e.name });
  const extra = logged.filter((x) => !planned.some((p) => p.name === x.name));
  return [...planned, ...extra];
}
