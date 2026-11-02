import { describe, expect, it } from "vitest";
import {
  completionRate,
  countByActivity,
  countByCategory,
  kmByMonth,
  kmByWeek,
  strengthProgress,
  streaks,
  totalKm,
  weekResults,
  type WeekResult,
} from "./stats";
import { emptyData } from "./migrations";
import { blankActivity, saveCustomActivity } from "./activities";
import { addDays } from "./dates";
import { s } from "./test-helpers";
import type { Session } from "../types";

/** A week where every required target is met, starting on `monday`. */
function fullWeek(monday: string): Session[] {
  const d = (i: number) => addDays(monday, i);
  return [
    s(d(0), "easy", { done: true }),
    s(d(1), "easy", { done: true }),
    s(d(2), "spice", { done: true }),
    s(d(3), "strength", { done: true }),
    s(d(4), "strength", { done: true }),
    s(d(5), "mobility", { done: true }),
    s(d(6), "mobility", { done: true }),
  ];
}

const w = (met: boolean, completion = met ? 1 : 0.5): WeekResult => ({ monday: "x", met, completion });

describe("weekResults", () => {
  it("covers every week from the first session to this week", () => {
    const data = { ...emptyData(), sessions: [...fullWeek("2026-10-12"), s("2026-10-27", "easy", { done: true })] };
    const weeks = weekResults(data, "2026-11-04");
    expect(weeks.map((x) => x.monday)).toEqual(["2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02"]);
    expect(weeks.map((x) => x.met)).toEqual([true, false, false, false]);
  });

  it("caps each category at its target when working out completion", () => {
    // 5 easy runs and nothing else: only 2 of 7 required sessions count
    const sessions = Array.from({ length: 5 }, (_, i) => s(addDays("2026-10-26", i), "easy", { done: true }));
    const [week] = weekResults({ ...emptyData(), sessions }, "2026-10-30");
    expect(week.completion).toBeCloseTo(2 / 7);
  });

  it("ignores the optional bonus category", () => {
    const sessions = fullWeek("2026-10-26");
    const [week] = weekResults({ ...emptyData(), sessions }, "2026-11-01");
    expect(week).toMatchObject({ met: true, completion: 1 });
  });

  it("is empty with no sessions", () => {
    expect(weekResults(emptyData(), "2026-11-02")).toEqual([]);
  });
});

describe("streaks", () => {
  it("counts the current run, ignoring an unfinished current week", () => {
    expect(streaks([w(true), w(false), w(true), w(true), w(false)])).toEqual({ current: 2, longest: 2 });
  });

  it("includes the current week once it's met", () => {
    expect(streaks([w(true), w(true), w(true)])).toEqual({ current: 3, longest: 3 });
  });

  it("resets when a full week is missed", () => {
    expect(streaks([w(true), w(true), w(true), w(false), w(true)])).toEqual({ current: 1, longest: 3 });
    expect(streaks([w(true), w(false), w(false)])).toEqual({ current: 0, longest: 1 });
  });

  it("handles no weeks", () => {
    expect(streaks([])).toEqual({ current: 0, longest: 0 });
  });
});

describe("completionRate", () => {
  const weeks = [w(true), w(false, 0.5), w(true), w(true), w(false, 0)]; // last is this week

  it("averages the last n full weeks, leaving out this week", () => {
    expect(completionRate(weeks, 2)).toEqual({ weeks: 2, weeksMet: 2, rate: 1 });
    expect(completionRate(weeks, 4)).toEqual({ weeks: 4, weeksMet: 3, rate: 3.5 / 4 });
  });

  it("uses fewer weeks when there isn't enough history", () => {
    expect(completionRate(weeks, 52)?.weeks).toBe(4);
  });

  it("is null with no full weeks yet", () => {
    expect(completionRate([w(true)], 4)).toBeNull();
  });
});

describe("running km", () => {
  const sessions = [
    s("2026-10-27", "easy", { done: true, log: { distanceKm: 5 } }),
    s("2026-10-29", "spice", { done: true, log: { distanceKm: 6.2 } }),
    s("2026-11-01", "spice", { done: true, log: { distanceKm: 11 } }), // Sunday, same week; November
    s("2026-11-02", "easy", { done: true, log: { distanceKm: 5.1 } }),
    s("2026-11-03", "easy", { log: { distanceKm: 5 } }), // not done
    s("2026-11-03", "bonus", { done: true, log: { distanceKm: 8 } }), // a walk, not a run
  ];

  it("sums logged distance per week, oldest first, ending this week", () => {
    const weeks = kmByWeek(sessions, "2026-11-04", 3);
    expect(weeks.map((b) => [b.start, b.value])).toEqual([
      ["2026-10-19", 0],
      ["2026-10-26", 22.2],
      ["2026-11-02", 5.1],
    ]);
  });

  it("sums per calendar month", () => {
    const months = kmByMonth(sessions, "2026-11-04", 2);
    expect(months.map((b) => [b.start, b.value])).toEqual([
      ["2026-10-01", 11.2],
      ["2026-11-01", 16.1],
    ]);
  });

  it("crosses the year boundary", () => {
    expect(kmByMonth([], "2027-01-10", 3).map((b) => b.start)).toEqual(["2026-11-01", "2026-12-01", "2027-01-01"]);
  });

  it("totals only done runs", () => {
    expect(totalKm(sessions)).toBe(27.3);
  });
});

describe("counts", () => {
  it("counts done sessions by category", () => {
    const sessions = [s("2026-11-02", "easy", { done: true }), s("2026-11-03", "easy"), s("2026-11-03", "mobility", { done: true })];
    expect(countByCategory(sessions)).toEqual([
      { category: "easy", count: 1 },
      { category: "spice", count: 0 },
      { category: "strength", count: 0 },
      { category: "mobility", count: 1 },
      { category: "bonus", count: 0 },
    ]);
  });

  it("counts by activity, most first, using current titles", () => {
    const custom = { ...blankActivity(), title: "Parkrun", category: "spice" as const };
    const data = saveCustomActivity(
      {
        ...emptyData(),
        sessions: [
          { ...s("2026-11-01", "easy", { done: true }), activityId: "easy-5k" },
          { ...s("2026-11-02", "spice", { done: true }), activityId: custom.id },
          { ...s("2026-11-09", "spice", { done: true }), activityId: custom.id },
          { ...s("2026-11-10", "spice"), activityId: custom.id },
          { ...s("2026-11-11", "easy", { done: true }), activityId: "gone-from-library" },
        ],
      },
      custom,
    );
    expect(countByActivity(data).map((c) => [c.title, c.count])).toEqual([
      ["Parkrun", 2],
      ["easy", 1], // not in the library any more, so the session snapshot's title
      ["Easy 5km", 1],
    ]);
  });
});

describe("strengthProgress", () => {
  it("collects each exercise over time, most recently done first", () => {
    const sessions = [
      s("2026-10-20", "strength", { done: true, log: { exercises: [{ name: "Goblet squat", reps: 10, weightKg: 5 }, { name: "Plank", sets: 3 }] } }),
      s("2026-10-27", "strength", { done: true, log: { exercises: [{ name: "goblet squat ", reps: 12, weightKg: 5 }] } }),
      s("2026-10-28", "strength", { log: { exercises: [{ name: "Goblet squat", reps: 99 }] } }), // not done
    ];
    const out = strengthProgress(sessions);
    expect(out.map((e) => e.name)).toEqual(["goblet squat", "Plank"]);
    expect(out[0].points).toEqual([
      { date: "2026-10-20", sets: undefined, reps: 10, weightKg: 5 },
      { date: "2026-10-27", sets: undefined, reps: 12, weightKg: 5 },
    ]);
  });
});
