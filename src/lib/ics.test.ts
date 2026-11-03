import { describe, expect, it } from "vitest";
import { addMinutes, buildIcs, escapeText, foldLine, icsFileName, minutesFromDuration } from "./ics";

const now = new Date(Date.UTC(2026, 10, 3, 8, 5, 9));

describe("buildIcs", () => {
  it("builds a timed event in floating local time", () => {
    const ics = buildIcs({ uid: "abc@training-week", title: "Easy 5km", description: "Conversation pace", date: "2026-11-04", time: "07:00", durationMin: 35, now });
    const lines = ics.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("DTSTART:20261104T070000");
    expect(lines).toContain("DTEND:20261104T073500");
    expect(lines).toContain("DTSTAMP:20261103T080509Z");
    expect(lines).toContain("SUMMARY:Easy 5km");
    expect(lines).toContain("DESCRIPTION:Conversation pace");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("builds an all-day event", () => {
    const ics = buildIcs({ uid: "x", title: "Long walk", description: "", date: "2026-12-31", durationMin: 45, now });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101");
    expect(ics).not.toContain("DESCRIPTION");
  });

  it("escapes and folds long descriptions", () => {
    const ics = buildIcs({ uid: "x", title: "Run, then stretch; rest", description: "a".repeat(200), date: "2026-11-04", time: "06:30", durationMin: 30, now });
    expect(ics).toContain("SUMMARY:Run\\, then stretch\\; rest");
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});

describe("helpers", () => {
  it("escapes special characters", () => {
    expect(escapeText("a\\b;c,d\ne")).toBe("a\\\\b\\;c\\,d\\ne");
  });

  it("folds without splitting multi-byte characters", () => {
    const folded = foldLine("SUMMARY:" + "–".repeat(40));
    for (const part of folded.split("\r\n")) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe("SUMMARY:" + "–".repeat(40));
  });

  it("reads durations", () => {
    expect(minutesFromDuration("30–35 min")).toBe(35);
    expect(minutesFromDuration("~15 min")).toBe(15);
    expect(minutesFromDuration("45+ min")).toBe(45);
    expect(minutesFromDuration("1.5 hours")).toBe(90);
    expect(minutesFromDuration("")).toBe(30);
  });

  it("adds minutes across midnight", () => {
    expect(addMinutes("2026-11-04", "23:30", 45)).toEqual({ date: "2026-11-05", time: "00:15" });
  });

  it("makes safe file names", () => {
    expect(icsFileName("Hill repeats: 6–8 × 30 sec", "2026-11-04")).toBe("hill-repeats-6-8-30-sec-2026-11-04.ics");
    expect(icsFileName("★", "2026-11-04")).toBe("session-2026-11-04.ics");
  });
});
