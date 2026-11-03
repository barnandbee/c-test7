import { describe, expect, it } from "vitest";
import { evaluateRosettes, rosetteFacts } from "./rosettes";
import { ROSETTES } from "../data/rosettes";
import { emptyData } from "./migrations";
import { addDays } from "./dates";
import { s } from "./test-helpers";
import type { Session } from "../types";

function fullWeek(monday: string): Session[] {
  const d = (i: number) => addDays(monday, i);
  return [
    s(d(0), "easy", { done: true, log: { distanceKm: 5 } }),
    s(d(1), "easy", { done: true, log: { distanceKm: 5 } }),
    s(d(2), "spice", { done: true, log: { distanceKm: 10.5 } }),
    s(d(3), "strength", { done: true }),
    s(d(4), "strength", { done: true }),
    s(d(5), "mobility", { done: true, neck: true }),
    s(d(6), "mobility", { done: true }),
  ];
}

const won = (data: ReturnType<typeof emptyData>, today: string) =>
  evaluateRosettes(ROSETTES, rosetteFacts(data, today))
    .filter((r) => r.won)
    .map((r) => r.id);

describe("rosette definitions", () => {
  it("has 20 with unique ids and short marks", () => {
    expect(ROSETTES).toHaveLength(20);
    expect(new Set(ROSETTES.map((r) => r.id)).size).toBe(20);
    for (const r of ROSETTES) expect([...r.mark].length, r.id).toBeLessThanOrEqual(4);
  });
});

describe("evaluateRosettes", () => {
  it("awards nothing with no sessions", () => {
    expect(won(emptyData(), "2026-11-03")).toEqual([]);
  });

  it("doesn't count planned sessions", () => {
    expect(won({ ...emptyData(), sessions: [s("2026-11-02", "easy")] }, "2026-11-03")).toEqual([]);
  });

  it("awards first steps, full house, double figures and a hat-trick", () => {
    const sessions = [...fullWeek("2026-10-12"), ...fullWeek("2026-10-19"), ...fullWeek("2026-10-26")];
    const ids = won({ ...emptyData(), sessions }, "2026-11-03");
    expect(ids).toEqual(expect.arrayContaining(["first-steps", "full-house", "hat-trick", "double-figures", "half-century"]));
    expect(ids).not.toContain("consistency-cup");
  });

  it("caps progress at the goal", () => {
    const sessions = Array.from({ length: 30 }, (_, i) => s(addDays("2026-09-01", i), "strength", { done: true }));
    const iron = evaluateRosettes(ROSETTES, rosetteFacts({ ...emptyData(), sessions }, "2026-11-03")).find((r) => r.id === "iron-will")!;
    expect(iron).toMatchObject({ value: 10, goal: 10, won: true });
  });

  it("matches hill and tempo sessions by title, including your own activities", () => {
    const hill = (d: string) => ({ ...s(d, "spice", { done: true }), snapshot: { title: "Hill repeats: 6–8 × 30 sec", short: "Hills", category: "spice" as const } });
    const tempo = (d: string) => ({ ...s(d, "spice", { done: true }), snapshot: { title: "My Tempo loop", short: "Tempo", category: "spice" as const } });
    const sessions = [1, 2, 3, 4, 5].flatMap((i) => [hill(`2026-10-0${i}`), tempo(`2026-10-1${i}`)]);
    expect(won({ ...emptyData(), sessions }, "2026-11-03")).toEqual(expect.arrayContaining(["hill-climber", "tempo-tamer", "spice-rack"]));
  });

  it("spots progressive overload only when a later weight beats the first", () => {
    const at = (d: string, kg: number) => s(d, "strength", { done: true, log: { exercises: [{ name: "Goblet squat", reps: 10, weightKg: kg }] } });
    expect(won({ ...emptyData(), sessions: [at("2026-10-01", 5), at("2026-10-08", 5)] }, "2026-11-03")).not.toContain("progressive-overload");
    expect(won({ ...emptyData(), sessions: [at("2026-10-01", 2), at("2026-10-08", 5)] }, "2026-11-03")).toContain("progressive-overload");
  });
});
