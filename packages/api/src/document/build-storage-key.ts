export function sanitizeDocumentFilename(filename: string) {
  const baseName = filename.split(/[/\\]/).pop() ?? "upload";
  const trimmed = baseName.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 255) : "upload";
}

export function buildDocumentStorageKey(
  tenantId: string,
  documentId: string,
  filename: string,
) {
  return `${tenantId}/documents/${documentId}/${sanitizeDocumentFilename(filename)}`;
}
