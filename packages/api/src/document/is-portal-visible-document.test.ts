import { describe, expect, it } from "vitest";
import {
  canPortalUserAccessDocument,
  isPortalVisibleDocument,
} from "./is-portal-visible-document";

describe("isPortalVisibleDocument", () => {
  it("allows portal and both visibility", () => {
    expect(isPortalVisibleDocument({ visibility: "portal", deletedAt: null, linkedEntityType: null, linkedEntityId: null })).toBe(true);
    expect(isPortalVisibleDocument({ visibility: "both", deletedAt: null, linkedEntityType: null, linkedEntityId: null })).toBe(true);
  });

  it("denies internal visibility and deleted documents", () => {
    expect(isPortalVisibleDocument({ visibility: "internal", deletedAt: null, linkedEntityType: null, linkedEntityId: null })).toBe(false);
    expect(isPortalVisibleDocument({ visibility: "portal", deletedAt: new Date(), linkedEntityType: null, linkedEntityId: null })).toBe(false);
  });
});

describe("canPortalUserAccessDocument", () => {
  it("allows tenant-wide portal documents", () => {
    expect(
      canPortalUserAccessDocument(
        { visibility: "portal", deletedAt: null, linkedEntityType: null, linkedEntityId: null },
        ["person-1"],
      ),
    ).toBe(true);
  });

  it("allows linked person documents for accessible persons", () => {
    expect(
      canPortalUserAccessDocument(
        {
          visibility: "both",
          deletedAt: null,
          linkedEntityType: "person",
          linkedEntityId: "child-1",
        },
        ["guardian-1", "child-1"],
      ),
    ).toBe(true);
  });

  it("denies internal visibility and unrelated person links", () => {
    expect(
      canPortalUserAccessDocument(
        {
          visibility: "internal",
          deletedAt: null,
          linkedEntityType: "person",
          linkedEntityId: "child-1",
        },
        ["guardian-1", "child-1"],
      ),
    ).toBe(false);

    expect(
      canPortalUserAccessDocument(
        {
          visibility: "portal",
          deletedAt: null,
          linkedEntityType: "person",
          linkedEntityId: "other-person",
        },
        ["guardian-1", "child-1"],
      ),
    ).toBe(false);
  });
});
