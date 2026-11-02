import { CATEGORY_ORDER } from "../data/categories";
import { LIBRARY } from "../data/library";
import type { Activity, AppData, CustomActivity } from "../types";
import { newId } from "./sessions";

const builtInById = new Map(LIBRARY.map((a) => [a.id, a]));

export function isBuiltIn(id: string): boolean {
  return builtInById.has(id);
}

/** Look up an activity by id, including deleted custom ones (so past sessions still resolve). */
export function findActivity(data: AppData, id: string): Activity | undefined {
  return builtInById.get(id) ?? data.customActivities.find((a) => a.id === id);
}

/** Every activity that should appear in the library: built-in plus live custom ones. */
export function allActivities(data: AppData): Activity[] {
  return [...LIBRARY, ...data.customActivities.filter((a) => !a.deleted)];
}

/**
 * Activities for the "add a session" picker: favourites first, then the rest,
 * each group in category order and then library order.
 */
export function activitiesForPicker(data: AppData): { favourites: Activity[]; others: Activity[] } {
  const favs = new Set(data.settings.favourites);
  const all = allActivities(data);
  const byCategory = (list: Activity[]) =>
    CATEGORY_ORDER.flatMap((c) => list.filter((a) => a.category === c));
  return {
    favourites: byCategory(all.filter((a) => favs.has(a.id))),
    others: byCategory(all.filter((a) => !favs.has(a.id))),
  };
}

export function isFavourite(data: AppData, id: string): boolean {
  return data.settings.favourites.includes(id);
}

export function toggleFavourite(data: AppData, id: string): AppData {
  const favs = data.settings.favourites;
  const favourites = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  return { ...data, settings: { ...data.settings, favourites } };
}

/** Remove empty optional fields so stored data stays tidy. */
function tidy(a: CustomActivity): CustomActivity {
  const out: CustomActivity = { ...a, title: a.title.trim(), short: (a.short || a.title).trim(), duration: a.duration.trim(), description: a.description.trim() };
  const steps = a.steps?.map((s) => s.trim()).filter(Boolean);
  const links = a.links?.map((l) => ({ label: l.label.trim() || l.url.trim(), url: l.url.trim() })).filter((l) => l.url);
  const exercises = a.exercises
    ?.map((e) => ({ name: e.name.trim(), dose: e.dose.trim(), howTo: e.howTo.trim() }))
    .filter((e) => e.name);
  if (steps?.length) out.steps = steps; else delete out.steps;
  if (links?.length) out.links = links; else delete out.links;
  if (exercises?.length) out.exercises = exercises; else delete out.exercises;
  if (!out.legs) delete out.legs;
  if (!out.neck) delete out.neck;
  if (!out.pace) delete out.pace;
  return out;
}

/** Create a new custom activity, or replace an existing one with the same id. */
export function saveCustomActivity(data: AppData, activity: CustomActivity): AppData {
  const a = tidy(activity);
  const exists = data.customActivities.some((c) => c.id === a.id);
  return {
    ...data,
    customActivities: exists ? data.customActivities.map((c) => (c.id === a.id ? a : c)) : [...data.customActivities, a],
  };
}

/** Hide a custom activity. It stays in storage so past sessions keep working. */
export function deleteCustomActivity(data: AppData, id: string): AppData {
  return {
    ...data,
    customActivities: data.customActivities.map((c) => (c.id === id ? { ...c, deleted: true } : c)),
    settings: { ...data.settings, favourites: data.settings.favourites.filter((f) => f !== id) },
  };
}

/** A blank custom activity for the editor. */
export function blankActivity(): CustomActivity {
  return { id: `custom-${newId()}`, custom: true, category: "easy", title: "", short: "", duration: "", description: "" };
}

/** A custom copy of any activity, as a starting point for editing. */
export function duplicateActivity(source: Activity): CustomActivity {
  return {
    ...structuredClone(source),
    id: `custom-${newId()}`,
    custom: true,
    title: `${source.title} (copy)`,
    // Blank so the diary uses the new title unless you set a short name
    short: "",
    deleted: undefined,
  };
}

/** Search link for an exercise's form video. */
export function exerciseVideoUrl(name: string): string {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(`${name} exercise beginner form`);
}
