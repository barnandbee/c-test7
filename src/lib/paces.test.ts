import { describe, expect, it } from "vitest";
import { computePaces, formatRange, formatTime, paceLines, parseTime, riegel } from "./paces";

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
    // Tempo: 25–30 sec per mile slower than 4:33/km = +15.5 to +18.6 sec per km
    expect(formatRange(p.tempo)).toBe("4:49–4:52");
    expect(formatRange(p.easy)).toBe("5:41–6:00");
    expect(formatRange(p.long)).toBe("5:18–6:03");
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

describe("paceLines", () => {
  const p = computePaces({ fiveK: 1365 })!;

  it("puts the main effort first and calls easy the warm-up next to a harder pace", () => {
    expect(paceLines(p, ["easy", "tempo"])).toEqual([
      { zone: "tempo", label: "Tempo pace", value: "4:49–4:52 /km" },
      { zone: "easy", label: "Warm-up and cool-down", value: "5:41–6:00 /km" },
    ]);
  });

  it("keeps the activity's order for the harder paces", () => {
    expect(paceLines(p, ["tempo", "race", "easy"]).map((l) => l.zone)).toEqual(["tempo", "race", "easy"]);
  });

  it("labels a lone easy pace as easy pace", () => {
    expect(paceLines(p, ["easy"])).toEqual([{ zone: "easy", label: "Easy pace", value: "5:41–6:00 /km" }]);
  });

  it("calls easy the warm-up in a hard session with no other pace, like hills", () => {
    expect(paceLines(p, ["easy"], true)[0].label).toBe("Warm-up and cool-down");
  });

  it("shows 5km pace as a single figure", () => {
    expect(paceLines(p, ["race"])[0].value).toBe("4:33 /km");
  });
});
