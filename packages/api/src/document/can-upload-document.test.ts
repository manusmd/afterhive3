import { describe, expect, it } from "vitest";
import { canUploadDocument } from "./can-upload-document";

describe("canUploadDocument", () => {
  it("allows owner and admin", () => {
    expect(canUploadDocument(["tenant_owner"])).toBe(true);
    expect(canUploadDocument(["tenant_admin"])).toBe(true);
  });

  it("denies other roles", () => {
    expect(canUploadDocument(["tenant_office"])).toBe(false);
    expect(canUploadDocument(["tenant_finance"])).toBe(false);
  });
});
