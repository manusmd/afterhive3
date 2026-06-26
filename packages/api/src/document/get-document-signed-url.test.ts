import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PortalSessionContext } from "../auth/get-portal-session";
import { setDocumentStorageForTests } from "./r2-storage";
import { GetDocumentSignedUrlError, getDocumentSignedUrl } from "./get-document-signed-url";

const tenantId = "tenant-1";
const tenantSlug = "demo-club";
const documentId = "doc-1";

const portalSession: PortalSessionContext = {
  userId: "user-1",
  surface: "portal",
  tenantId,
  tenantSlug,
  roles: ["portal_parent"],
  personId: "guardian-1",
};

const getDb = vi.hoisted(() => vi.fn());

vi.mock("@afterhive/db", () => ({
  getDb,
}));

function mockDb(results: { limited?: unknown[][]; listed?: unknown[][] }) {
  let limitedCall = 0;
  let listedCall = 0;
  const insertValues = vi.fn(() => Promise.resolve());

  getDb.mockReturnValue({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => {
            const result = results.limited?.[limitedCall] ?? [];
            limitedCall += 1;
            return Promise.resolve(result);
          },
          then(onFulfilled: (value: unknown[]) => unknown, onRejected?: (reason: unknown) => unknown) {
            const result = results.listed?.[listedCall] ?? [];
            listedCall += 1;
            return Promise.resolve(result).then(onFulfilled, onRejected);
          },
        }),
      }),
    }),
    insert: () => ({
      values: insertValues,
    }),
  });

  return { insertValues };
}

describe("getDocumentSignedUrl", () => {
  beforeEach(() => {
    getDb.mockReset();
    setDocumentStorageForTests({
      putObject: vi.fn(async () => undefined),
      getSignedUrl: vi.fn(async () => "https://signed.example/doc"),
    });
  });

  it("throws forbidden for internal visibility", async () => {
    mockDb({
      limited: [
        [{ id: tenantId }],
        [
          {
            id: documentId,
            tenantId,
            storageKey: "key",
            filename: "report.pdf",
            visibility: "internal",
            deletedAt: null,
            linkedEntityType: null,
            linkedEntityId: null,
          },
        ],
      ],
      listed: [[{ personId: "child-1" }]],
    });

    await expect(getDocumentSignedUrl(portalSession, tenantSlug, documentId)).rejects.toMatchObject({
      code: "forbidden",
    });
  });

  it("returns presigned url and writes audit entry for portal-visible documents", async () => {
    const getSignedUrl = vi.fn(async () => "https://signed.example/report.pdf");
    const { insertValues } = mockDb({
      limited: [
        [{ id: tenantId }],
        [
          {
            id: documentId,
            tenantId,
            storageKey: `${tenantId}/documents/${documentId}/report.pdf`,
            filename: "report.pdf",
            visibility: "portal",
            deletedAt: null,
            linkedEntityType: null,
            linkedEntityId: null,
          },
        ],
      ],
      listed: [[{ personId: "child-1" }]],
    });

    setDocumentStorageForTests({
      putObject: vi.fn(async () => undefined),
      getSignedUrl,
    });

    const result = await getDocumentSignedUrl(portalSession, tenantSlug, documentId);

    expect(result.url).toBe("https://signed.example/report.pdf");
    expect(result.filename).toBe("report.pdf");
    expect(result.expiresInSeconds).toBe(900);
    expect(getSignedUrl).toHaveBeenCalled();
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "document.download",
        entityType: "document",
        entityId: documentId,
      }),
    );
  });

  it("throws document_not_found when document is missing", async () => {
    mockDb({
      limited: [[{ id: tenantId }], []],
    });

    await expect(getDocumentSignedUrl(portalSession, tenantSlug, documentId)).rejects.toBeInstanceOf(
      GetDocumentSignedUrlError,
    );
  });
});
