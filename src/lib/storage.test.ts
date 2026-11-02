import { describe, expect, it } from "vitest";
import { CURRENT_VERSION, DataVersionError, emptyData, migrate } from "./migrations";
import { loadData, saveData, STORAGE_KEY } from "./storage";
import { addDays, mondayOf } from "./dates";
import { s } from "./test-helpers";

class MemoryStorage {
  map = new Map<string, string>();
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
}
const mem = () => new MemoryStorage() as unknown as Storage;

describe("migrate", () => {
  it("accepts current data unchanged", () => {
    const data = { ...emptyData(), sessions: [s("2026-10-20", "easy", { done: true })] };
    expect(migrate(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });

  it("fills in missing targets and drops malformed sessions", () => {
    const out = migrate({ version: 1, sessions: [{ id: "x" }, s("2026-10-20", "easy")], settings: { targets: { easy: 3 } } });
    expect(out.sessions).toHaveLength(1);
    expect(out.settings.targets).toMatchObject({ easy: 3, spice: 1, strength: 2, mobility: 2, bonus: 1 });
  });

  it("rejects data from a newer version", () => {
    expect(() => migrate({ version: CURRENT_VERSION + 1 })).toThrow(DataVersionError);
  });

  it("rejects data with no version", () => {
    expect(() => migrate({ sessions: [] })).toThrow();
  });
});

describe("loadData / saveData", () => {
  it("returns empty data when nothing is stored", () => {
    expect(loadData(mem())).toEqual({ data: emptyData() });
  });

  it("round-trips", () => {
    const store = mem();
    const data = { ...emptyData(), sessions: [s("2026-10-20", "spice")] };
    saveData(data, store);
    expect(loadData(store).data).toEqual(data);
  });

  it("reports unreadable data and leaves it in place", () => {
    const store = mem();
    store.setItem(STORAGE_KEY, "{not json");
    const result = loadData(store);
    expect(result.error).toBeDefined();
    expect(store.getItem(STORAGE_KEY)).toBe("{not json");
  });
});

describe("dates", () => {
  it("finds the Monday of a week", () => {
    expect(mondayOf("2026-10-25")).toBe("2026-10-19"); // Sunday
    expect(mondayOf("2026-10-19")).toBe("2026-10-19");
    expect(mondayOf("2026-11-01")).toBe("2026-10-26");
  });

  it("adds days across the clock change", () => {
    // UK clocks go back on 25 October 2026
    expect(addDays("2026-10-24", 1)).toBe("2026-10-25");
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
  });
});
