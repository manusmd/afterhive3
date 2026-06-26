import { describe, expect, it } from "vitest";
import { canReadPortalDocuments } from "./can-read-portal-documents";

describe("canReadPortalDocuments", () => {
  it("allows portal_parent", () => {
    expect(canReadPortalDocuments(["portal_parent"])).toBe(true);
  });

  it("denies staff roles", () => {
    expect(canReadPortalDocuments(["tenant_owner"])).toBe(false);
    expect(canReadPortalDocuments([])).toBe(false);
  });
});
