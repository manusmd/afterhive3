import { describe, expect, it } from "vitest";
import {
  buildPackageDescription,
  resolveCustomNetCents,
  resolvePackageNetCents,
  resolveSeasonNetCents,
} from "./contract-billing-amounts";

describe("resolvePackageNetCents", () => {
  it("returns the flat package amount from the tariff config", () => {
    expect(resolvePackageNetCents(13000)).toBe(13000);
  });
});

describe("resolveSeasonNetCents", () => {
  it("returns the full season amount when billing starts on season start", () => {
    expect(resolveSeasonNetCents(32000, "2025-09-01", "2026-06-30", "2025-09-01")).toBe(32000);
  });

  it("pro-rates the season amount for a mid-season join", () => {
    expect(resolveSeasonNetCents(32000, "2025-09-01", "2026-06-30", "2026-01-15")).toBe(17637);
  });
});

describe("resolveCustomNetCents", () => {
  it("uses the contract custom amount for custom tariffs", () => {
    expect(resolveCustomNetCents(3000)).toBe(3000);
    expect(resolveCustomNetCents(0)).toBe(0);
  });

  it("rejects missing custom amounts", () => {
    expect(resolveCustomNetCents(null)).toBeNull();
    expect(resolveCustomNetCents(undefined)).toBeNull();
  });
});

describe("buildPackageDescription", () => {
  it("includes the session count in the line description", () => {
    expect(buildPackageDescription("10-session card", 10)).toBe("10-session card (10 sessions)");
  });
});
