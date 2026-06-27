import { describe, expect, it } from "vitest";
import { canReadOffers } from "../offer/can-read-offers";
import { canReadSessions } from "./can-read-sessions";

const locationNorth = "loc-north";

describe("canReadSessions", () => {
  it("allows owner and admin regardless of location scope", () => {
    expect(canReadSessions(["tenant_owner"], undefined)).toBe(true);
    expect(canReadSessions(["tenant_admin"], [])).toBe(true);
  });

  it("denies finance even though offer.read allows it", () => {
    expect(canReadOffers(["tenant_finance"], undefined)).toBe(true);
    expect(canReadSessions(["tenant_finance"], undefined)).toBe(false);
  });

  it("allows assigned-location roles only with non-empty location scope", () => {
    expect(canReadSessions(["tenant_office"], [locationNorth])).toBe(true);
    expect(canReadSessions(["tenant_coach"], [locationNorth])).toBe(true);
    expect(canReadSessions(["tenant_location_manager"], [locationNorth])).toBe(true);
    expect(canReadSessions(["tenant_office"], [])).toBe(false);
    expect(canReadSessions(["tenant_coach"], undefined)).toBe(false);
  });

  it("denies legacy office_staff and empty roles", () => {
    expect(canReadSessions(["office_staff"], [locationNorth])).toBe(false);
    expect(canReadSessions([])).toBe(false);
  });
});
