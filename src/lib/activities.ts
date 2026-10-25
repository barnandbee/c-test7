import { LIBRARY } from "../data/library";
import type { Activity } from "../types";

const byId = new Map(LIBRARY.map((a) => [a.id, a]));

export function findActivity(id: string): Activity | undefined {
  return byId.get(id);
}

/** Search link for an exercise's form video. */
export function exerciseVideoUrl(name: string): string {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(`${name} exercise beginner form`);
}
