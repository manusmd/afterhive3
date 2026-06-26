import { describe, expect, it } from "vitest";
import { buildDocumentStorageKey, sanitizeDocumentFilename } from "./build-storage-key";

describe("buildDocumentStorageKey", () => {
  it("builds tenant-scoped document keys", () => {
    expect(
      buildDocumentStorageKey("tenant-1", "doc-1", "report.pdf"),
    ).toBe("tenant-1/documents/doc-1/report.pdf");
  });

  it("strips path segments from filenames", () => {
    expect(sanitizeDocumentFilename("../../secret.pdf")).toBe("secret.pdf");
  });
});
