import { describe, expect, it } from "vitest";
import { parseMinutes, parseNumber } from "./numbers";

describe("parseNumber", () => {
  it("accepts a comma or full stop as the decimal point", () => {
    expect(parseNumber("5.2")).toBe(5.2);
    expect(parseNumber(" 5,2 ")).toBe(5.2);
  });
  it("treats blank, zero and junk as not recorded", () => {
    for (const t of ["", " ", "0", "-3", "abc"]) expect(parseNumber(t), t).toBeUndefined();
  });
});

describe("parseMinutes", () => {
  it("reads plain minutes and m:ss", () => {
    expect(parseMinutes("29")).toBe(29);
    expect(parseMinutes("29.5")).toBe(29.5);
    expect(parseMinutes("29:30")).toBe(29.5);
    expect(parseMinutes("1:05:00")).toBe(65);
    expect(parseMinutes("29:3")).toBeUndefined();
  });
});
