import { describe, expect, it } from "vitest";
import { parseTenantStatus } from "./list-tenants";

describe("parseTenantStatus", () => {
  it("accepts valid tenant statuses", () => {
    expect(parseTenantStatus("trial")).toBe("trial");
    expect(parseTenantStatus("active")).toBe("active");
    expect(parseTenantStatus("suspended")).toBe("suspended");
    expect(parseTenantStatus("closed")).toBe("closed");
  });

  it("rejects unknown or empty values", () => {
    expect(parseTenantStatus("pending")).toBeUndefined();
    expect(parseTenantStatus("")).toBeUndefined();
    expect(parseTenantStatus(undefined)).toBeUndefined();
  });
});
