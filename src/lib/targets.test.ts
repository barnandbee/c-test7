import { describe, expect, it } from "vitest";
import { allTargetsMet, weekSummary } from "./targets";
import { defaultTargets } from "./migrations";
import { s } from "./test-helpers";

const MON = "2026-10-19";
const lane = (summary: ReturnType<typeof weekSummary>, cat: string) => summary.find((l) => l.category === cat)!;

describe("weekSummary", () => {
  it("counts done and planned sessions per category within the week only", () => {
    const sessions = [
      s("2026-10-19", "easy", { done: true }),
      s("2026-10-21", "easy"),
      s("2026-10-25", "easy", { done: true }), // Sunday, same week
      s("2026-10-26", "easy", { done: true }), // next Monday
      s("2026-10-18", "easy", { done: true }), // previous Sunday
    ];
    const easy = lane(weekSummary(sessions, MON, defaultTargets()), "easy");
    expect(easy).toMatchObject({ done: 2, planned: 1, target: 2, met: true });
  });

  it("uses the targets passed in", () => {
    const targets = { ...defaultTargets(), strength: 3 };
    const sessions = [s("2026-10-20", "strength", { done: true }), s("2026-10-22", "strength", { done: true })];
    expect(lane(weekSummary(sessions, MON, targets), "strength")).toMatchObject({ done: 2, target: 3, met: false });
  });

  it("notes more than one spice run, planned or done", () => {
    const sessions = [s("2026-10-20", "spice"), s("2026-10-23", "spice")];
    expect(lane(weekSummary(sessions, MON, defaultTargets()), "spice").note).toMatch(/One spice run/);
    expect(lane(weekSummary(sessions.slice(0, 1), MON, defaultTargets()), "spice").note).toBeUndefined();
  });

  it("nudges for a neck session once mobility is done without one", () => {
    const without = [s("2026-10-20", "mobility", { done: true })];
    expect(lane(weekSummary(without, MON, defaultTargets()), "mobility").note).toMatch(/neck and shoulders/);
    const withNeck = [...without, s("2026-10-22", "mobility", { done: true, neck: true })];
    expect(lane(weekSummary(withNeck, MON, defaultTargets()), "mobility").note).toBeUndefined();
    // A planned (not done) neck session doesn't count yet
    const planned = [...without, s("2026-10-22", "mobility", { neck: true })];
    expect(lane(weekSummary(planned, MON, defaultTargets()), "mobility").note).toMatch(/neck and shoulders/);
  });
});

describe("allTargetsMet", () => {
  const full = [
    s("2026-10-19", "easy", { done: true }),
    s("2026-10-20", "easy", { done: true }),
    s("2026-10-21", "spice", { done: true }),
    s("2026-10-22", "strength", { done: true }),
    s("2026-10-23", "strength", { done: true }),
    s("2026-10-24", "mobility", { done: true }),
    s("2026-10-25", "mobility", { done: true }),
  ];

  it("ignores the optional bonus category", () => {
    expect(allTargetsMet(weekSummary(full, MON, defaultTargets()))).toBe(true);
  });

  it("is false when any required target is missed", () => {
    expect(allTargetsMet(weekSummary(full.slice(1), MON, defaultTargets()))).toBe(false);
  });

  it("treats a target of 0 as met", () => {
    const targets = { ...defaultTargets(), easy: 0 };
    expect(allTargetsMet(weekSummary(full.slice(2), MON, targets))).toBe(true);
  });
});
