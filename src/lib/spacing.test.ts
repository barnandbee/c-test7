import { describe, expect, it } from "vitest";
import { legsBeforeSpiceDates } from "./spacing";
import { s } from "./test-helpers";

describe("legsBeforeSpiceDates", () => {
  it("flags a leg session the day before a spice run", () => {
    const sessions = [s("2026-10-20", "strength", { legs: true }), s("2026-10-21", "spice")];
    expect([...legsBeforeSpiceDates(sessions)]).toEqual(["2026-10-20"]);
  });

  it("ignores non-leg strength sessions", () => {
    const sessions = [s("2026-10-20", "strength"), s("2026-10-21", "spice")];
    expect(legsBeforeSpiceDates(sessions).size).toBe(0);
  });

  it("ignores spice runs on the same day or two days later", () => {
    const sessions = [s("2026-10-20", "strength", { legs: true }), s("2026-10-20", "spice"), s("2026-10-22", "spice")];
    expect(legsBeforeSpiceDates(sessions).size).toBe(0);
  });

  it("works across the week boundary and month end", () => {
    const sessions = [
      s("2026-10-25", "strength", { legs: true }), // Sunday
      s("2026-10-26", "spice"), // Monday
      s("2026-10-31", "strength", { legs: true }),
      s("2026-11-01", "spice"),
    ];
    expect([...legsBeforeSpiceDates(sessions)].sort()).toEqual(["2026-10-25", "2026-10-31"]);
  });
});
