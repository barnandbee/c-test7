import type { AppData } from "../types";
import { migrate } from "./migrations";

export const BACKUP_APP = "training-week";

/** Serialise all data for a backup file. */
export function exportJson(data: AppData, exportedAt = new Date().toISOString()): string {
  return JSON.stringify({ app: BACKUP_APP, exportedAt, ...data }, null, 2);
}

export function backupFileName(date: string): string {
  return `training-week-backup-${date}.json`;
}

export interface ImportSummary {
  data: AppData;
  sessions: number;
  customActivities: number;
}

/** Parse and upgrade a backup file. Throws with a readable message if it can't be used. */
export function parseBackup(text: string): ImportSummary {
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file isn’t valid JSON.");
  }
  if (!raw || typeof raw !== "object" || (raw.app !== undefined && raw.app !== BACKUP_APP)) {
    throw new Error("That file isn’t a Training week backup.");
  }
  const { app: _app, exportedAt: _at, ...rest } = raw;
  const data = migrate(rest);
  return {
    data,
    sessions: data.sessions.length,
    customActivities: data.customActivities.filter((a) => !a.deleted).length,
  };
}
