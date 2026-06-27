import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLUB_SPORT_MODULE,
  loadTenantModules,
  tenantHasClubSportModule,
  tenantModulesIncludeClubSport,
} from "./has-club-sport-module";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

describe("tenantModulesIncludeClubSport", () => {
  it("returns true when club_sport is enabled", () => {
    expect(tenantModulesIncludeClubSport(["crm", CLUB_SPORT_MODULE])).toBe(true);
  });

  it("returns false when club_sport is missing", () => {
    expect(tenantModulesIncludeClubSport(["crm", "scheduling"])).toBe(false);
  });
});

describe("tenantHasClubSportModule", () => {
  beforeEach(() => {
    getDb.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ modules: ["crm", CLUB_SPORT_MODULE] }]),
          }),
        }),
      }),
    });
  });

  it("loads tenant modules from the database", async () => {
    await expect(tenantHasClubSportModule("tenant-1")).resolves.toBe(true);
    await expect(loadTenantModules("tenant-1")).resolves.toEqual(["crm", CLUB_SPORT_MODULE]);
  });
});
