import type { DocumentVisibility } from "@afterhive/shared";

export type PortalDocumentRecord = {
  visibility: DocumentVisibility;
  deletedAt: Date | null;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
};

export function isPortalVisibleDocument(document: PortalDocumentRecord) {
  if (document.deletedAt) {
    return false;
  }

  return document.visibility === "portal" || document.visibility === "both";
}

export function canPortalUserAccessDocument(
  document: PortalDocumentRecord,
  accessiblePersonIds: string[],
) {
  if (!isPortalVisibleDocument(document)) {
    return false;
  }

  if (!document.linkedEntityType || !document.linkedEntityId) {
    return true;
  }

  if (document.linkedEntityType !== "person") {
    return false;
  }

  return accessiblePersonIds.includes(document.linkedEntityId);
}
