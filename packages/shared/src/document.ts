export const DOCUMENT_MIME_ALLOWLIST = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const DOCUMENT_MAX_BYTES = 25 * 1024 * 1024;

export type DocumentVisibility = "internal" | "portal" | "both";

export function isAllowedDocumentMimeType(mimeType: string) {
  return DOCUMENT_MIME_ALLOWLIST.has(mimeType);
}
