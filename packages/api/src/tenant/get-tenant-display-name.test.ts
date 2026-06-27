import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTenantDisplayName } from "./get-tenant-display-name";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

describe("getTenantDisplayName", () => {
  beforeEach(() => {
    getDb.mockReset();
  });

  it("returns the tenant name when a matching slug exists", async () => {
    getDb.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ name: "Demo Club" }]),
          }),
        }),
      }),
    });

    await expect(getTenantDisplayName("demo-club")).resolves.toBe("Demo Club");
  });

  it("falls back to the slug when no tenant row is found", async () => {
    getDb.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }),
    });

    await expect(getTenantDisplayName("missing-club")).resolves.toBe("missing-club");
  });
});
