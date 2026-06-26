import { describe, expect, it } from "vitest";
import { getMappedValue, parseCsv } from "./csv-parse";

describe("parseCsv", () => {
  it("parses headers and rows", () => {
    const content = "first_name,last_name\nAnna,Nord\nBen,Sued";

    expect(parseCsv(content)).toEqual({
      headers: ["first_name", "last_name"],
      rows: [
        { first_name: "Anna", last_name: "Nord" },
        { first_name: "Ben", last_name: "Sued" },
      ],
    });
  });

  it("supports quoted values with commas", () => {
    const content = 'first_name,last_name\n"Anna, Jr.",Nord';

    expect(parseCsv(content).rows[0]).toEqual({
      first_name: "Anna, Jr.",
      last_name: "Nord",
    });
  });

  it("skips blank rows", () => {
    const content = "first_name,last_name\nAnna,Nord\n,\nBen,Sued";

    expect(parseCsv(content).rows).toHaveLength(2);
  });
});

describe("getMappedValue", () => {
  it("returns trimmed mapped values", () => {
    expect(getMappedValue({ Vorname: " Anna " }, "Vorname")).toBe("Anna");
    expect(getMappedValue({}, "missing")).toBe("");
  });
});
