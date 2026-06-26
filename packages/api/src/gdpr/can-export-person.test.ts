import { describe, expect, it } from "vitest";
import { canExportPerson } from "./can-export-person";

const locationNorth = "loc-north";

describe("canExportPerson", () => {
  it("allows owner and admin by default", () => {
    expect(canExportPerson(["tenant_owner"], undefined)).toBe(true);
    expect(canExportPerson(["tenant_admin"], [])).toBe(true);
  });

  it("requires assigned locations for scoped roles", () => {
    expect(canExportPerson(["tenant_office"], [])).toBe(false);
    expect(canExportPerson(["tenant_office"], [locationNorth])).toBe(true);
    expect(canExportPerson(["tenant_location_manager"], [locationNorth])).toBe(true);
  });

  it("denies finance and coach", () => {
    expect(canExportPerson(["tenant_finance"], undefined)).toBe(false);
    expect(canExportPerson(["tenant_coach"], [locationNorth])).toBe(false);
  });
});
