"use client";

import type { TenantStatus } from "@afterhive/api/platform/list-tenants";
import { useT } from "@afterhive/ui";
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
import { SuspendTenantButton } from "@/components/SuspendTenantButton";

export function TenantListFilters() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const status = searchParams.get("status") ?? "";
  const plan = searchParams.get("plan") ?? "";

  const statusOptions: { value: TenantStatus | ""; label: string }[] = [
    { value: "", label: t("platform.tenants.filters.status.all") },
    { value: "trial", label: t("platform.tenants.filters.status.trial") },
    { value: "active", label: t("platform.tenants.filters.status.active") },
    { value: "suspended", label: t("platform.tenants.filters.status.suspended") },
    { value: "closed", label: t("platform.tenants.filters.status.closed") },
  ];

  const planOptions = [
    { value: "", label: t("platform.tenants.filters.plan.all") },
    { value: "starter", label: t("platform.tenants.filters.plan.starter") },
    { value: "growth", label: t("platform.tenants.filters.plan.growth") },
    { value: "enterprise", label: t("platform.tenants.filters.plan.enterprise") },
  ];

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
        <InputLabel id="tenant-status-filter">{t("platform.tenants.filters.status.label")}</InputLabel>
        <Select
          labelId="tenant-status-filter"
          label={t("platform.tenants.filters.status.label")}
          value={status}
          disabled={pending}
          onChange={(event) => updateFilters(event.target.value, plan)}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value || "all"} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="tenant-plan-filter">{t("platform.tenants.filters.plan.label")}</InputLabel>
        <Select
          labelId="tenant-plan-filter"
          label={t("platform.tenants.filters.plan.label")}
          value={plan}
          disabled={pending}
          onChange={(event) => updateFilters(status, event.target.value)}
        >
          {planOptions.map((option) => (
            <MenuItem key={option.value || "all"} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {status || plan ? (
        <Button component={Link} href="/tenants" disabled={pending}>
          {t("platform.tenants.filters.reset")}
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
  canSuspend?: boolean;
};

export function TenantList({ items, nextCursor, canSuspend = false }: TenantListProps) {
  const t = useT();
  const searchParams = useSearchParams();
  const hasFilters = Boolean(searchParams.get("status") || searchParams.get("plan"));

  if (items.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">
          {hasFilters
            ? t("platform.tenants.list.emptyFiltered")
            : t("platform.tenants.list.empty")}
        </Typography>
        {!hasFilters ? (
          <Button component={Link} href="/tenants/new" variant="contained" sx={{ mt: 2 }}>
            {t("platform.tenants.list.createFirst")}
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

  const tableHeadings = [
    t("platform.tenants.table.name"),
    t("platform.tenants.table.slug"),
    t("platform.tenants.table.status"),
    t("platform.tenants.table.plan"),
    t("platform.tenants.table.subscription"),
    t("platform.tenants.table.created"),
    ...(canSuspend ? [t("platform.tenants.table.actions")] : []),
  ];

  return (
    <Stack spacing={2}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {tableHeadings.map((heading) => (
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
                {canSuspend ? (
                  <Box component="td" sx={{ py: 1.5, px: 1, borderBottom: 1, borderColor: "divider" }}>
                    <SuspendTenantButton
                      tenantId={tenant.id}
                      tenantName={tenant.name}
                      status={tenant.status}
                    />
                  </Box>
                ) : null}
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
            {canSuspend ? (
              <Box sx={{ mt: 1 }}>
                <SuspendTenantButton
                  tenantId={tenant.id}
                  tenantName={tenant.name}
                  status={tenant.status}
                />
              </Box>
            ) : null}
          </Box>
        ))}
      </Stack>

      {nextHref ? (
        <Box>
          <Button component={Link} href={nextHref} variant="outlined">
            {t("platform.tenants.pagination.next")}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}

export function TenantListError() {
  const t = useT();

  return <Alert severity="error">{t("platform.tenants.list.error.loadFailed")}</Alert>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
