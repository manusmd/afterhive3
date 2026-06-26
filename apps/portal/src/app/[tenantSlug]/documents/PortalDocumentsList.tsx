"use client";

import { useT } from "@afterhive/ui";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

type PortalDocumentListItem = {
  documentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  visibility: "portal" | "both";
  createdAt: string;
};

type PortalDocumentsListProps = {
  tenantSlug: string;
  documents: PortalDocumentListItem[];
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PortalDocumentsList({ tenantSlug, documents }: PortalDocumentsListProps) {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null);

  function mapDownloadError(code?: string) {
    switch (code) {
      case "forbidden":
        return t("portal.documents.error.forbidden");
      case "document_not_found":
        return t("portal.documents.error.notFound");
      default:
        return t("portal.documents.error.default");
    }
  }

  async function onDownload(documentId: string, filename: string) {
    setError(null);
    setLoadingDocumentId(documentId);

    try {
      const response = await fetch(`/portal/api/documents/${documentId}/url`, {
        headers: {
          "x-tenant-slug": tenantSlug,
        },
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapDownloadError(payload.error));
        setLoadingDocumentId(null);
        return;
      }

      const payload = (await response.json()) as { url?: string; filename?: string };
      const downloadUrl = payload.url;
      const downloadName = payload.filename ?? filename;

      if (!downloadUrl) {
        setError(mapDownloadError());
        setLoadingDocumentId(null);
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = downloadName;
      anchor.rel = "noopener noreferrer";
      anchor.target = "_blank";
      anchor.click();
      setLoadingDocumentId(null);
    } catch {
      setError(mapDownloadError());
      setLoadingDocumentId(null);
    }
  }

  if (documents.length === 0) {
    return (
      <Typography color="text.secondary">{t("portal.documents.empty")}</Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {documents.map((item) => (
        <Stack
          key={item.documentId}
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <Stack spacing={0.5}>
            <Typography>{item.filename}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatFileSize(item.sizeBytes)}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            disabled={loadingDocumentId === item.documentId}
            onClick={() => onDownload(item.documentId, item.filename)}
          >
            {loadingDocumentId === item.documentId
              ? t("portal.documents.downloading")
              : t("portal.documents.download")}
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
