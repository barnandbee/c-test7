import { describe, expect, it } from "vitest";
import { cleanLog, completeSession, exerciseLogDefaults, lastExerciseLog, parseDose } from "./sessions";
import { emptyData } from "./migrations";
import { LIBRARY } from "../data/library";
import { s } from "./test-helpers";

describe("completeSession", () => {
  it("marks done and stores a cleaned log", () => {
    const sess = s("2026-11-02", "easy");
    const d = completeSession({ ...emptyData(), sessions: [sess] }, sess.id, {
      distanceKm: 5.2,
      durationMin: 29,
      effort: 4,
      note: "  felt good ",
      weightKg: undefined,
    });
    expect(d.sessions[0]).toMatchObject({ done: true, log: { distanceKm: 5.2, durationMin: 29, effort: 4, note: "felt good" } });
  });

  it("stores no log when nothing was entered", () => {
    const sess = s("2026-11-02", "easy", { log: { distanceKm: 5 } });
    const d = completeSession({ ...emptyData(), sessions: [sess] }, sess.id, { note: " " });
    expect(d.sessions[0].done).toBe(true);
    expect(d.sessions[0].log).toBeUndefined();
  });
});

describe("cleanLog", () => {
  it("clamps effort to 1–10 and drops empty exercise rows", () => {
    expect(cleanLog({ effort: 14, exercises: [{ name: "Plank" }, { name: "Row", reps: 10, weightKg: 5 }] })).toEqual({
      effort: 10,
      exercises: [{ name: "Row", reps: 10, weightKg: 5 }],
    });
  });

  it("drops zero and negative numbers", () => {
    expect(cleanLog({ distanceKm: 0, durationMin: -5 })).toBeUndefined();
  });
});

describe("parseDose", () => {
  it("reads reps and kg where they're clear", () => {
    expect(parseDose("10 reps · 5kg")).toEqual({ reps: 10, weightKg: 5 });
    expect(parseDose("10 per arm · 5kg")).toEqual({ reps: 10, weightKg: 5 });
    expect(parseDose("12 reps · 5kg on hips")).toEqual({ reps: 12, weightKg: 5 });
    expect(parseDose("20–30 sec per side")).toEqual({});
    expect(parseDose("8–10 reps")).toEqual({ reps: 10 });
  });
});

describe("exercise log defaults", () => {
  const strA = LIBRARY.find((a) => a.id === "str-a")!;

  it("uses the plan's numbers the first time", () => {
    const rows = exerciseLogDefaults([], strA, "2026-11-02");
    expect(rows[0]).toEqual({ name: "Goblet squat", reps: 10, weightKg: 5 });
    expect(rows).toHaveLength(strA.exercises!.length);
  });

  it("uses your most recent logged values after that", () => {
    const older = s("2026-10-20", "strength", { done: true, log: { exercises: [{ name: "Goblet squat", sets: 2, reps: 10, weightKg: 5 }] } });
    const newer = s("2026-10-27", "strength", { done: true, log: { exercises: [{ name: "goblet squat", sets: 3, reps: 12, weightKg: 5 }] } });
    expect(lastExerciseLog([older, newer], "Goblet squat")).toMatchObject({ sets: 3, reps: 12 });
    expect(exerciseLogDefaults([newer, older], strA, "2026-11-02")[0]).toEqual({ name: "Goblet squat", sets: 3, reps: 12, weightKg: 5 });
    // Editing an older session's log shouldn't pull in later values
    expect(exerciseLogDefaults([newer, older], strA, "2026-10-21")[0]).toMatchObject({ sets: 2 });
  });
});
