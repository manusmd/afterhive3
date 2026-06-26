import { describe, expect, it } from "vitest";
import { getMessages } from "./index";
import { createTranslator, DEFAULT_LOCALE } from "./translate";

describe("createTranslator", () => {
  const t = createTranslator(getMessages(DEFAULT_LOCALE));

  it("resolves nested keys from the default catalog", () => {
    expect(t("admin.login.title")).toBe("Anmelden");
    expect(t("platform.tenants.title")).toBe("Tenants");
  });

  it("interpolates placeholders", () => {
    expect(t("admin.dashboard.signedInAs", { userId: "u1", tenantSlug: "demo" })).toBe(
      "Angemeldet als u1 in demo",
    );
  });

  it("returns the key when a translation is missing", () => {
    expect(t("admin.missing.key")).toBe("admin.missing.key");
  });
});
