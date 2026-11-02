import { describe, expect, it } from "vitest";
import { backupFileName, exportJson, parseBackup } from "./backup";
import { emptyData } from "./migrations";
import { blankActivity, saveCustomActivity } from "./activities";
import { s } from "./test-helpers";

describe("backup", () => {
  const data = saveCustomActivity(
    { ...emptyData(), sessions: [s("2026-11-02", "easy", { done: true, log: { distanceKm: 5 } })] },
    { ...blankActivity(), title: "Bike" },
  );

  it("round-trips everything", () => {
    const result = parseBackup(exportJson(data, "2026-11-02T08:00:00.000Z"));
    expect(result.data).toEqual(data);
    expect(result.sessions).toBe(1);
    expect(result.customActivities).toBe(1);
  });

  it("includes the app name and export time", () => {
    const parsed = JSON.parse(exportJson(data, "2026-11-02T08:00:00.000Z"));
    expect(parsed.app).toBe("training-week");
    expect(parsed.exportedAt).toBe("2026-11-02T08:00:00.000Z");
  });

  it("upgrades older backups", () => {
    const v1 = JSON.stringify({ app: "training-week", version: 1, sessions: [], settings: { targets: {} } });
    expect(parseBackup(v1).data.version).toBe(3);
  });

  it("rejects files that aren't backups", () => {
    expect(() => parseBackup("not json")).toThrow(/valid JSON/);
    expect(() => parseBackup(JSON.stringify({ app: "other", version: 2 }))).toThrow(/backup/);
    expect(() => parseBackup(JSON.stringify({ hello: 1 }))).toThrow();
  });

  it("names files by date", () => {
    expect(backupFileName("2026-11-02")).toBe("training-week-backup-2026-11-02.json");
  });
});
