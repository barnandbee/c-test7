import { describe, expect, it } from "vitest";
import { computePaces, formatRange, formatTime, paceForZone, parseTime, riegel } from "./paces";

describe("parseTime", () => {
  it("reads minutes and seconds with a colon or full stop", () => {
    expect(parseTime("22:45")).toBe(1365);
    expect(parseTime("22.45")).toBe(1365);
    expect(parseTime(" 5:40 ")).toBe(340);
  });

  it("reads hours", () => {
    expect(parseTime("1:02:30")).toBe(3750);
  });

  it("rejects malformed times", () => {
    for (const bad of ["", "22", "22:4", "22:60", "a:bc", "22:45:1", "0:00", "-1:00"]) {
      expect(parseTime(bad), bad).toBeNull();
    }
  });
});

describe("formatTime", () => {
  it("formats minutes and hours", () => {
    expect(formatTime(273)).toBe("4:33");
    expect(formatTime(1365)).toBe("22:45");
    expect(formatTime(3750)).toBe("1:02:30");
    expect(formatRange([341, 360])).toBe("5:41–6:00");
  });
});

describe("computePaces", () => {
  it("returns null with no 5km time", () => {
    expect(computePaces({})).toBeNull();
  });

  it("derives paces from a 22:45 5km", () => {
    const p = computePaces({ fiveK: 1365, tenK: 2995 })!;
    expect(formatTime(p.race)).toBe("4:33");
    expect(formatTime(p.tenK)).toBe("5:00"); // 49:55 / 10 = 4:59.5
    expect(p.tenKPredicted).toBe(false);
    expect(formatRange(p.tempo)).toBe("4:49–4:58");
    expect(formatRange(p.easy)).toBe("5:41–6:00");
    expect(formatRange(p.recovery)).toBe("6:00–6:30");
  });

  it("predicts 10km from 5km when no 10km time is set", () => {
    const p = computePaces({ fiveK: 1365 })!;
    expect(p.tenKPredicted).toBe(true);
    expect(p.tenKTime).toBe(Math.round(riegel(1365, 5, 10)));
    expect(formatTime(p.tenKTime)).toBe("47:26");
  });

  it("uses your own easy and tempo ranges when set", () => {
    const p = computePaces({ fiveK: 1365, easyOverride: [340, 360], tempoOverride: [290, 300] })!;
    expect(p.easy).toEqual([340, 360]);
    expect(p.easyCustom).toBe(true);
    expect(p.tempo).toEqual([290, 300]);
    expect(p.recovery).toEqual([360, 390]);
  });

  it("gets faster as the 5km time improves", () => {
    const now = computePaces({ fiveK: 1365 })!;
    const later = computePaces({ fiveK: 1320 })!; // 22:00
    expect(later.easy[0]).toBeLessThan(now.easy[0]);
    expect(later.tempo[0]).toBeLessThan(now.tempo[0]);
  });
});

describe("paceForZone", () => {
  it("describes each zone", () => {
    const p = computePaces({ fiveK: 1365 })!;
    expect(paceForZone(p, "easy")).toBe("Easy pace: 5:41–6:00 /km");
    expect(paceForZone(p, "race")).toBe("5km race pace: around 4:33 /km");
  });
});
