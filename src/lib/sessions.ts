import type { Activity, AppData, Session } from "../types";

function newId(): string {
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

export function sessionsBetween(sessions: Session[], from: string, to: string): Session[] {
  return sessions.filter((s) => s.date >= from && s.date <= to);
}
