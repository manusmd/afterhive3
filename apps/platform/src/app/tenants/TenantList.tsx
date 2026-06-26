"use client";

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { TenantStatus } from "@afterhive/api/platform/list-tenants";

const STATUS_OPTIONS: { value: TenantStatus | ""; label: string }[] = [
  { value: "", label: "Alle Status" },
  { value: "trial", label: "Trial" },
  { value: "active", label: "Aktiv" },
  { value: "suspended", label: "Gesperrt" },
  { value: "closed", label: "Geschlossen" },
];

const PLAN_OPTIONS = [
  { value: "", label: "Alle Plaene" },
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "enterprise", label: "Enterprise" },
];

export function TenantListFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const status = searchParams.get("status") ?? "";
  const plan = searchParams.get("plan") ?? "";

  function updateFilters(nextStatus: string, nextPlan: string) {
    const params = new URLSearchParams();

    if (nextStatus) {
      params.set("status", nextStatus);
    }

    if (nextPlan) {
      params.set("plan", nextPlan);
    }

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `/tenants?${query}` : "/tenants");
    });
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { sm: "center" } }}
    >
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="tenant-status-filter">Status</InputLabel>
        <Select
          labelId="tenant-status-filter"
          label="Status"
          value={status}
          disabled={pending}
          onChange={(event) => updateFilters(event.target.value, plan)}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.label} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="tenant-plan-filter">Plan</InputLabel>
        <Select
          labelId="tenant-plan-filter"
          label="Plan"
          value={plan}
          disabled={pending}
          onChange={(event) => updateFilters(status, event.target.value)}
        >
          {PLAN_OPTIONS.map((option) => (
            <MenuItem key={option.label} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {status || plan ? (
        <Button component={Link} href="/tenants" disabled={pending}>
          Filter zuruecksetzen
        </Button>
      ) : null}
    </Stack>
  );
}

type TenantListItemView = {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  planId: string;
  subscriptionStatus: string;
  createdAt: string;
};

type TenantListProps = {
  items: TenantListItemView[];
  nextCursor: string | null;
};

export function TenantList({ items, nextCursor }: TenantListProps) {
  const searchParams = useSearchParams();
  const hasFilters = Boolean(searchParams.get("status") || searchParams.get("plan"));

  if (items.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">
          {hasFilters ? "Keine Tenants fuer diese Filter." : "Noch keine Tenants vorhanden."}
        </Typography>
        {!hasFilters ? (
          <Button component={Link} href="/tenants/new" variant="contained" sx={{ mt: 2 }}>
            Ersten Tenant anlegen
          </Button>
        ) : null}
      </Box>
    );
  }

  const nextParams = new URLSearchParams(searchParams.toString());

  if (nextCursor) {
    nextParams.set("cursor", nextCursor);
  }

  const nextHref = nextCursor ? `/tenants?${nextParams.toString()}` : null;

  return (
    <Stack spacing={2}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["Name", "Slug", "Status", "Plan", "Abonnement", "Erstellt"].map((heading) => (
                <Box
                  component="th"
                  key={heading}
                  sx={{
                    textAlign: "left",
                    py: 1.5,
                    px: 1,
                    borderBottom: 1,
                    borderColor: "divider",
                    typography: "subtitle2",
                  }}
                >
                  {heading}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {items.map((tenant) => (
              <Box component="tr" key={tenant.id}>
                <Box component="td" sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}>
                  {tenant.name}
                </Box>
                <Box component="td" sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}>
                  {tenant.slug}
                </Box>
                <Box component="td" sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}>
                  {tenant.status}
                </Box>
                <Box component="td" sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}>
                  {tenant.planId}
                </Box>
                <Box component="td" sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}>
                  {tenant.subscriptionStatus}
                </Box>
                <Box component="td" sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}>
                  {formatDate(tenant.createdAt)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
        {items.map((tenant) => (
          <Box
            key={tenant.id}
            sx={{
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1">{tenant.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {tenant.slug}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {tenant.status} · {tenant.planId} · {tenant.subscriptionStatus}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(tenant.createdAt)}
            </Typography>
          </Box>
        ))}
      </Stack>

      {nextHref ? (
        <Box>
          <Button component={Link} href={nextHref} variant="outlined">
            Naechste Seite
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}

export function TenantListError() {
  return <Alert severity="error">Tenants konnten nicht geladen werden.</Alert>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
