import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { canAccessClubSport, canManageClubRoster } from "./can-access-club-sport";

const tenantHasClubSportModule = vi.hoisted(() => vi.fn(() => Promise.resolve(true)));

vi.mock("../tenant/has-club-sport-module", () => ({
  tenantHasClubSportModule,
}));

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId: "tenant-1",
  tenantSlug: "demo-club",
  roles: ["tenant_owner"],
};

describe("canAccessClubSport", () => {
  beforeEach(() => {
    tenantHasClubSportModule.mockResolvedValue(true);
  });

  it("requires club_sport module", async () => {
    tenantHasClubSportModule.mockResolvedValueOnce(false);
    await expect(canAccessClubSport(ownerSession)).resolves.toBe(false);
  });

  it("allows owner when module is enabled", async () => {
    await expect(canAccessClubSport(ownerSession)).resolves.toBe(true);
  });
});

describe("canManageClubRoster", () => {
  beforeEach(() => {
    tenantHasClubSportModule.mockResolvedValue(true);
  });

  it("requires club_sport module for writes", async () => {
    tenantHasClubSportModule.mockResolvedValueOnce(false);
    await expect(canManageClubRoster(ownerSession)).resolves.toBe(false);
  });
});
