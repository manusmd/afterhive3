import type { createTranslator } from "./translate";

type Translator = ReturnType<typeof createTranslator>;

const TENANT_STATUS_KEYS = {
  trial: "platform.tenants.filters.status.trial",
  active: "platform.tenants.filters.status.active",
  suspended: "platform.tenants.filters.status.suspended",
  closed: "platform.tenants.filters.status.closed",
} as const;

const TENANT_PLAN_KEYS = {
  starter: "platform.tenants.filters.plan.starter",
  growth: "platform.tenants.filters.plan.growth",
  enterprise: "platform.tenants.filters.plan.enterprise",
} as const;

const SUBSCRIPTION_STATUS_KEYS = {
  trialing: "platform.tenants.subscription.trialing",
  active: "platform.tenants.subscription.active",
  past_due: "platform.tenants.subscription.pastDue",
  canceled: "platform.tenants.subscription.canceled",
} as const;

const LEAD_STATUS_KEYS = {
  new: "admin.leads.status.new",
  contacted: "admin.leads.status.contacted",
  qualified: "admin.leads.status.qualified",
  converted: "admin.leads.status.converted",
  lost: "admin.leads.status.lost",
} as const;

const LEAD_SOURCE_KEYS = {
  manual: "admin.leads.source.manual",
  web: "admin.leads.source.web",
  marketplace: "admin.leads.source.marketplace",
  import: "admin.leads.source.import",
  phone: "admin.leads.source.phone",
} as const;

const STAFF_ROLE_KEYS = {
  tenant_admin: "admin.team.roles.administrator",
  tenant_office: "admin.team.roles.office",
  tenant_coach: "admin.team.roles.coach",
  tenant_finance: "admin.team.roles.finance",
  tenant_location_manager: "admin.team.roles.locationManager",
} as const;

const OFFER_TYPE_KEYS = {
  team: "admin.offers.type.team",
  course: "admin.offers.type.course",
  workshop: "admin.offers.type.workshop",
  subscription: "admin.offers.type.subscription",
} as const;

const OFFER_STATUS_KEYS = {
  draft: "admin.offers.status.draft",
  internal: "admin.offers.status.internal",
  published: "admin.offers.status.published",
  archived: "admin.offers.status.archived",
} as const;

function translateMappedValue(
  t: Translator,
  value: string,
  keys: Record<string, string>,
): string {
  const key = keys[value as keyof typeof keys];
  return key ? t(key) : value;
}

export function translateTenantStatus(t: Translator, status: string): string {
  return translateMappedValue(t, status, TENANT_STATUS_KEYS);
}

export function translateTenantPlan(t: Translator, planId: string): string {
  return translateMappedValue(t, planId, TENANT_PLAN_KEYS);
}

export function translateSubscriptionStatus(t: Translator, status: string): string {
  return translateMappedValue(t, status, SUBSCRIPTION_STATUS_KEYS);
}

export function translateLeadStatus(t: Translator, status: string): string {
  return translateMappedValue(t, status, LEAD_STATUS_KEYS);
}

export function translateLeadSource(t: Translator, source: string): string {
  return translateMappedValue(t, source, LEAD_SOURCE_KEYS);
}

export function translateStaffRole(t: Translator, role: string): string {
  return translateMappedValue(t, role, STAFF_ROLE_KEYS);
}

export function translateOfferType(t: Translator, type: string): string {
  return translateMappedValue(t, type, OFFER_TYPE_KEYS);
}

export function translateOfferStatus(t: Translator, status: string): string {
  return translateMappedValue(t, status, OFFER_STATUS_KEYS);
}
