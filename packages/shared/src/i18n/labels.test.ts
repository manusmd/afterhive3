import { describe, expect, it } from "vitest";
import { getMessages } from "./index";
import {
  translateLeadSource,
  translateLeadStatus,
  translateOfferStatus,
  translateOfferType,
  translatePortalRole,
  translateStaffRole,
  translateSubscriptionStatus,
  translateTenantPlan,
  translateTenantStatus,
} from "./labels";
import { createTranslator, DEFAULT_LOCALE } from "./translate";

describe("i18n display labels", () => {
  const t = createTranslator(getMessages(DEFAULT_LOCALE));

  it("translates tenant status, plan, and subscription values", () => {
    expect(translateTenantStatus(t, "trial")).toBe("Testphase");
    expect(translateTenantPlan(t, "starter")).toBe("Einsteiger");
    expect(translateSubscriptionStatus(t, "past_due")).toBe("Zahlung ueberfaellig");
  });

  it("translates lead status and source values", () => {
    expect(translateLeadStatus(t, "new")).toBe("Neu");
    expect(translateLeadSource(t, "manual")).toBe("Manuell");
  });

  it("translates staff role codes", () => {
    expect(translateStaffRole(t, "tenant_owner")).toBe("Inhaber");
    expect(translateStaffRole(t, "tenant_office")).toBe("Buero");
  });

  it("translates portal role codes", () => {
    expect(translatePortalRole(t, "portal_parent")).toBe("Erziehungsberechtigte:r");
  });

  it("translates offer type and status values", () => {
    expect(translateOfferType(t, "course")).toBe("Kurs");
    expect(translateOfferStatus(t, "draft")).toBe("Entwurf");
  });

  it("falls back to raw values for unknown codes", () => {
    expect(translateLeadStatus(t, "unknown")).toBe("unknown");
  });
});
