export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

const PIPELINE_TRANSITIONS: Record<LeadStatus, readonly LeadStatus[]> = {
  new: ["contacted", "lost"],
  contacted: ["qualified", "lost"],
  qualified: ["lost"],
  converted: [],
  lost: ["new"],
};

export function getAllowedLeadTransitions(from: string): LeadStatus[] {
  if (!isLeadStatus(from)) {
    return [];
  }

  return [...PIPELINE_TRANSITIONS[from]];
}

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.includes(value as LeadStatus);
}

export function canTransitionLeadStatus(from: string, to: string): boolean {
  if (!isLeadStatus(from) || !isLeadStatus(to)) {
    return false;
  }

  return PIPELINE_TRANSITIONS[from].includes(to);
}

export function requiresLostReason(to: string): boolean {
  return to === "lost";
}

export function requiresAdminReopen(from: string, to: string): boolean {
  return from === "lost" && to === "new";
}

export function canReopenLostLead(roles: string[]): boolean {
  return roles.some((role) => role === "tenant_owner" || role === "tenant_admin");
}
