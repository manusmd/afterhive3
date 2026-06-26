"use client";

import { useT } from "@afterhive/ui";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { FormEvent, useState, type ChangeEvent } from "react";

type UploadDocumentFormProps = {
  tenantSlug: string;
};

type UploadDocumentResult = {
  documentId: string;
  filename: string;
  sizeBytes: number;
};

export function UploadDocumentForm({ tenantSlug }: UploadDocumentFormProps) {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadDocumentResult | null>(null);
  const [loading, setLoading] = useState(false);

  function mapUploadError(code?: string) {
    switch (code) {
      case "mime_not_allowed":
        return t("admin.documents.upload.error.mimeNotAllowed");
      case "file_too_large":
        return t("admin.documents.upload.error.fileTooLarge");
      case "invalid_file":
        return t("admin.documents.upload.error.invalidFile");
      case "forbidden":
        return t("admin.documents.upload.error.forbidden");
      default:
        return t("admin.documents.upload.error.default");
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setError(null);
    setResult(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError(t("admin.documents.upload.error.invalidFile"));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/app/api/documents/upload", {
        method: "POST",
        headers: {
          "x-tenant-slug": tenantSlug,
        },
        body: formData,
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapUploadError(payload.error ?? (response.status === 403 ? "forbidden" : undefined)));
        setLoading(false);
        return;
      }

      const uploadResult = (await response.json()) as UploadDocumentResult;
      setResult(uploadResult);
      setFile(null);
      setLoading(false);
    } catch {
      setError(mapUploadError());
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 720 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {result ? (
          <Alert severity="success">
            {t("admin.documents.upload.success", {
              filename: result.filename,
              size: result.sizeBytes,
            })}
          </Alert>
        ) : null}
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {t("admin.documents.upload.hint")}
          </Typography>
          <Button variant="outlined" component="label">
            {t("admin.documents.upload.selectFile")}
            <input hidden type="file" onChange={onFileChange} />
          </Button>
          {file ? <Typography variant="body2">{file.name}</Typography> : null}
        </Stack>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !file}
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
        >
          {loading ? t("admin.documents.upload.submitting") : t("admin.documents.upload.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
