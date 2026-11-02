import { describe, expect, it } from "vitest";
import { labelEvery, niceTicks } from "./ticks";

describe("niceTicks", () => {
  it("uses round steps that reach the maximum", () => {
    expect(niceTicks(22.2)).toEqual([0, 10, 20, 30]);
    expect(niceTicks(7)).toEqual([0, 2, 4, 6, 8]);
    expect(niceTicks(5)).toEqual([0, 2, 4, 6]);
    expect(niceTicks(0.8)).toEqual([0, 0.2, 0.4, 0.6, 0.8]);
  });

  it("gives a usable axis for zero", () => {
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});

describe("labelEvery", () => {
  it("thins labels to fit", () => {
    expect(labelEvery(12, 600, 40)).toBe(1);
    expect(labelEvery(12, 300, 44)).toBe(2);
    expect(labelEvery(12, 160, 44)).toBe(4);
  });
});
