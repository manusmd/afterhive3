import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionContext } from "@afterhive/domain";
import { setDocumentStorageForTests } from "./r2-storage";
import { UploadDocumentError, uploadDocument } from "./upload-document";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const documentId = "doc-1";

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

const ownerSession: SessionContext = {
  userId: "owner-1",
  surface: "tenant_admin",
  tenantId,
  tenantSlug,
  roles: ["tenant_owner"],
  locationIds: undefined,
};

describe("uploadDocument", () => {
  beforeEach(() => {
    getDb.mockReset();
    setDocumentStorageForTests({
      putObject: vi.fn(async () => undefined),
    });
  });

  it("throws mime_not_allowed for unsupported files", async () => {
    await expect(
      uploadDocument(ownerSession, tenantSlug, {
        filename: "virus.exe",
        mimeType: "application/x-msdownload",
        body: Buffer.from("bad"),
      }),
    ).rejects.toMatchObject({ code: "mime_not_allowed" });
  });

  it("stores metadata and uploads to storage", async () => {
    const putObject = vi.fn(async () => undefined);
    setDocumentStorageForTests({ putObject });

    getDb.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ id: tenantId }]),
          }),
        }),
      }),
      insert: () => ({
        values: () => ({
          returning: () =>
            Promise.resolve([
              {
                id: documentId,
                storageKey: `${tenantId}/documents/${documentId}/report.pdf`,
                filename: "report.pdf",
                mimeType: "application/pdf",
                sizeBytes: 4,
                sha256: "expected",
                visibility: "internal",
                createdAt: new Date("2024-01-01"),
              },
            ]),
        }),
      }),
    });

    const result = await uploadDocument(ownerSession, tenantSlug, {
      filename: "report.pdf",
      mimeType: "application/pdf",
      body: Buffer.from("data"),
    });

    expect(putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining(`/documents/`),
        contentType: "application/pdf",
      }),
    );
    expect(result.documentId).toBe(documentId);
    expect(result.filename).toBe("report.pdf");
  });

  it("throws storage_failed when upload fails", async () => {
    setDocumentStorageForTests({
      putObject: vi.fn(async () => {
        throw new Error("network");
      }),
    });

    getDb.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ id: tenantId }]),
          }),
        }),
      }),
    });

    await expect(
      uploadDocument(ownerSession, tenantSlug, {
        filename: "report.pdf",
        mimeType: "application/pdf",
        body: Buffer.from("data"),
      }),
    ).rejects.toBeInstanceOf(UploadDocumentError);
  });
});
