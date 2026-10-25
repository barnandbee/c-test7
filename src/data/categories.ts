import type { Category } from "../types";

export interface CategoryInfo {
  label: string;
  one: string;
  note: string;
  defaultTarget: number;
  /** Optional categories don't count towards "all targets met". */
  optional?: boolean;
}

export const CATEGORY_ORDER: Category[] = ["easy", "spice", "strength", "mobility", "bonus"];

export const CATEGORIES: Record<Category, CategoryInfo> = {
  easy: { label: "Easy runs", one: "Easy run", note: "Conversation pace", defaultTarget: 2 },
  spice: { label: "Spice run", one: "Spice run", note: "Intervals, hills, tempo or long", defaultTarget: 1 },
  strength: { label: "Strength", one: "Strength", note: "20–30 mins", defaultTarget: 2 },
  mobility: { label: "Mobility", one: "Mobility", note: "One for neck and shoulders", defaultTarget: 2 },
  bonus: { label: "Bonus", one: "Bonus", note: "Optional", defaultTarget: 1, optional: true },
};
