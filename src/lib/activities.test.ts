import { describe, expect, it } from "vitest";
import {
  activitiesForPicker,
  allActivities,
  blankActivity,
  deleteCustomActivity,
  duplicateActivity,
  findActivity,
  saveCustomActivity,
  toggleFavourite,
} from "./activities";
import { emptyData } from "./migrations";
import { LIBRARY } from "../data/library";

describe("favourites", () => {
  it("toggles on and off", () => {
    let d = toggleFavourite(emptyData(), "str-a");
    expect(d.settings.favourites).toEqual(["str-a"]);
    d = toggleFavourite(d, "str-a");
    expect(d.settings.favourites).toEqual([]);
  });

  it("puts favourites first in the picker, in category order", () => {
    let d = toggleFavourite(emptyData(), "mob-jr-10");
    d = toggleFavourite(d, "easy-strides");
    const { favourites, others } = activitiesForPicker(d);
    expect(favourites.map((a) => a.id)).toEqual(["easy-strides", "mob-jr-10"]);
    expect(others.some((a) => a.id === "easy-strides")).toBe(false);
    expect(favourites.length + others.length).toBe(LIBRARY.length);
  });
});

describe("custom activities", () => {
  it("creates, edits and tidies blank optional fields", () => {
    const a = { ...blankActivity(), title: " Parkrun ", category: "spice" as const, steps: ["", "Go"], links: [{ label: "", url: "" }] };
    let d = saveCustomActivity(emptyData(), a);
    const saved = d.customActivities[0];
    expect(saved).toMatchObject({ title: "Parkrun", short: "Parkrun", steps: ["Go"] });
    expect(saved.links).toBeUndefined();
    d = saveCustomActivity(d, { ...saved, title: "Parkrun 5km" });
    expect(d.customActivities).toHaveLength(1);
    expect(d.customActivities[0].title).toBe("Parkrun 5km");
    expect(allActivities(d)).toHaveLength(LIBRARY.length + 1);
  });

  it("hides deleted activities but still resolves them for past sessions", () => {
    const a = { ...blankActivity(), title: "Bike" };
    let d = toggleFavourite(saveCustomActivity(emptyData(), a), a.id);
    d = deleteCustomActivity(d, a.id);
    expect(allActivities(d).some((x) => x.id === a.id)).toBe(false);
    expect(findActivity(d, a.id)?.title).toBe("Bike");
    expect(d.settings.favourites).toEqual([]);
  });

  it("duplicates a built-in activity with a new id and its own copy of the content", () => {
    const src = LIBRARY.find((a) => a.id === "str-a")!;
    const copy = duplicateActivity(src);
    expect(copy.id).not.toBe(src.id);
    expect(copy.id.startsWith("custom-")).toBe(true);
    expect(copy.title).toBe("Session A: legs + core (copy)");
    expect(copy.legs).toBe(true);
    expect(copy.short).toBe("");
    copy.exercises![0].name = "Changed";
    expect(src.exercises![0].name).toBe("Goblet squat");
  });
});
