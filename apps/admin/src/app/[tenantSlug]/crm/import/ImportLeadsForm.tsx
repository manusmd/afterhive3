"use client";

import { parseCsv } from "@afterhive/shared/csv-parse";
import { useT } from "@afterhive/ui";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useMemo, useState, type ChangeEvent } from "react";

type LocationOption = {
  id: string;
  name: string;
};

type ImportLeadsFormProps = {
  tenantSlug: string;
  locations: LocationOption[];
};

type ImportResult = {
  jobId: string;
  status: string;
  result: {
    imported: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  };
};

export function ImportLeadsForm({ tenantSlug, locations }: ImportLeadsFormProps) {
  const t = useT();
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [firstNameColumn, setFirstNameColumn] = useState("");
  const [lastNameColumn, setLastNameColumn] = useState("");
  const [sourceColumn, setSourceColumn] = useState("");
  const [locationCodeColumn, setLocationCodeColumn] = useState("");
  const [defaultLocationId, setDefaultLocationId] = useState(locations[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const parsed = useMemo(() => (csvContent ? parseCsv(csvContent) : null), [csvContent]);
  const headers = parsed?.headers ?? [];
  const previewRows = parsed?.rows.slice(0, 5) ?? [];

  function mapImportError(code?: string) {
    switch (code) {
      case "invalid_csv":
        return t("admin.import.error.invalidCsv");
      case "invalid_mapping":
        return t("admin.import.error.invalidMapping");
      case "invalid_location":
        return t("admin.import.error.invalidLocation");
      case "too_many_rows":
        return t("admin.import.error.tooManyRows");
      case "location_forbidden":
      case "forbidden":
        return t("admin.import.error.forbidden");
      default:
        return t("admin.import.error.default");
    }
  }

  function mapRowError(message: string) {
    switch (message) {
      case "missing_required_fields":
        return t("admin.import.rowError.missingRequiredFields");
      case "invalid_location":
        return t("admin.import.rowError.invalidLocation");
      case "location_forbidden":
        return t("admin.import.rowError.locationForbidden");
      case "insert_failed":
        return t("admin.import.rowError.insertFailed");
      default:
        return message;
    }
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setResult(null);
    setError(null);
    setFirstNameColumn("");
    setLastNameColumn("");
    setSourceColumn("");
    setLocationCodeColumn("");
    setCsvContent(await file.text());
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/app/api/crm/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify({
          csvContent,
          fileName,
          defaultLocationId: locationCodeColumn ? undefined : defaultLocationId,
          mapping: {
            firstName: firstNameColumn,
            lastName: lastNameColumn,
            source: sourceColumn || undefined,
            locationCode: locationCodeColumn || undefined,
          },
        }),
      });

      if (!response.ok) {
        let payload: { error?: string } = {};
        try {
          payload = (await response.json()) as { error?: string };
        } catch {
          payload = {};
        }
        setError(mapImportError(payload.error));
        setLoading(false);
        return;
      }

      setResult((await response.json()) as ImportResult);
      setLoading(false);
    } catch {
      setError(mapImportError());
      setLoading(false);
    }
  }

  if (locations.length === 0) {
    return (
      <Typography color="text.secondary">{t("admin.import.noLocations")}</Typography>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 720 }}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {result ? (
          <Alert severity={result.result.failed > 0 ? "warning" : "success"}>
            {t("admin.import.result.summary", {
              imported: result.result.imported,
              failed: result.result.failed,
            })}
          </Alert>
        ) : null}
        <Button variant="outlined" component="label">
          {t("admin.import.upload")}
          <input hidden type="file" accept=".csv,text/csv" onChange={onFileChange} />
        </Button>
        {headers.length > 0 ? (
          <>
            <FormControl fullWidth required>
              <InputLabel id="import-first-name-column">
                {t("admin.import.mapping.firstName")}
              </InputLabel>
              <Select
                labelId="import-first-name-column"
                label={t("admin.import.mapping.firstName")}
                value={firstNameColumn}
                onChange={(event) => setFirstNameColumn(event.target.value)}
              >
                {headers.map((header) => (
                  <MenuItem key={header} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="import-last-name-column">
                {t("admin.import.mapping.lastName")}
              </InputLabel>
              <Select
                labelId="import-last-name-column"
                label={t("admin.import.mapping.lastName")}
                value={lastNameColumn}
                onChange={(event) => setLastNameColumn(event.target.value)}
              >
                {headers.map((header) => (
                  <MenuItem key={header} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="import-source-column">{t("admin.import.mapping.source")}</InputLabel>
              <Select
                labelId="import-source-column"
                label={t("admin.import.mapping.source")}
                value={sourceColumn}
                onChange={(event) => setSourceColumn(event.target.value)}
              >
                <MenuItem value="">{t("admin.import.mapping.none")}</MenuItem>
                {headers.map((header) => (
                  <MenuItem key={header} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="import-location-column">
                {t("admin.import.mapping.locationName")}
              </InputLabel>
              <Select
                labelId="import-location-column"
                label={t("admin.import.mapping.locationName")}
                value={locationCodeColumn}
                onChange={(event) => setLocationCodeColumn(event.target.value)}
              >
                <MenuItem value="">{t("admin.import.mapping.none")}</MenuItem>
                {headers.map((header) => (
                  <MenuItem key={header} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("admin.import.mapping.locationNameHelper")}
              </Typography>
            </FormControl>
            {!locationCodeColumn ? (
              <FormControl fullWidth required>
                <InputLabel id="import-default-location">
                  {t("admin.import.defaultLocation.label")}
                </InputLabel>
                <Select
                  labelId="import-default-location"
                  label={t("admin.import.defaultLocation.label")}
                  value={defaultLocationId}
                  onChange={(event) => setDefaultLocationId(event.target.value)}
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            {previewRows.length > 0 ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">{t("admin.import.preview.title")}</Typography>
                {previewRows.map((row, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    {firstNameColumn ? row[firstNameColumn] : "?"} {lastNameColumn ? row[lastNameColumn] : "?"}
                  </Typography>
                ))}
              </Stack>
            ) : null}
          </>
        ) : null}
        {result && result.result.errors.length > 0 ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">{t("admin.import.errors.title")}</Typography>
            {result.result.errors.map((entry) => (
              <Typography key={`${entry.row}-${entry.message}`} variant="body2" color="error">
                {t("admin.import.errors.row", {
                  row: entry.row,
                  message: mapRowError(entry.message),
                })}
              </Typography>
            ))}
          </Stack>
        ) : null}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !csvContent || !firstNameColumn || !lastNameColumn}
          startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
        >
          {loading ? t("admin.import.submitting") : t("admin.import.submit")}
        </Button>
      </Stack>
    </Box>
  );
}
