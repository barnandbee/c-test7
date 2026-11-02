import type { AppData } from "../types";
import { emptyData, migrate } from "./migrations";

export const STORAGE_KEY = "training-week:data";

export interface LoadResult {
  data: AppData;
  /** Set when stored data couldn't be read. Saving is disabled so nothing is overwritten. */
  error?: string;
}

export function loadData(storage: Storage = localStorage): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: emptyData(), error: "This browser is blocking storage, so changes won’t be kept." };
  }
  if (!raw) return { data: emptyData() };
  try {
    return { data: migrate(JSON.parse(raw)) };
  } catch (e) {
    // Keep the unreadable copy untouched and refuse to save over it.
    return {
      data: emptyData(),
      error: `Your saved data couldn’t be read (${(e as Error).message}). Nothing has been changed. Restore from a backup or reload.`,
    };
  }
}

export function saveData(data: AppData, storage: Storage = localStorage): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
