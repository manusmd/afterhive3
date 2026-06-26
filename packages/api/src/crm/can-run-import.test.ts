import { describe, expect, it } from "vitest";
import { canRunImport } from "./can-run-import";

describe("canRunImport", () => {
  it("allows owner and admin", () => {
    expect(canRunImport(["tenant_owner"])).toBe(true);
    expect(canRunImport(["tenant_admin"])).toBe(true);
  });

  it("requires assigned locations for scoped roles", () => {
    expect(canRunImport(["tenant_office"], [])).toBe(false);
    expect(canRunImport(["tenant_office"], ["loc-1"])).toBe(true);
  });

  it("denies finance and coach", () => {
    expect(canRunImport(["tenant_finance"], ["loc-1"])).toBe(false);
    expect(canRunImport(["tenant_coach"], ["loc-1"])).toBe(false);
  });
});
