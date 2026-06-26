export type Surface = "platform" | "tenant_admin" | "portal";

export type Action =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "approve"
  | "issue"
  | "impersonate";

export type ResourceRef = {
  type: string;
  id?: string;
  tenantId?: string;
  locationId?: string;
};

export type RoleAssignmentLocation = {
  role: string;
  locationIds: string[] | null;
};

export type SessionContext = {
  userId: string;
  surface: Surface;
  tenantId?: string;
  tenantSlug?: string;
  roles: string[];
  locationIds?: string[];
  roleAssignments?: RoleAssignmentLocation[];
  impersonation?: { actorUserId: string; expiresAt: string };
};

export type PolicyResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export type PolicyHandler = (
  ctx: SessionContext,
  action: Action,
  resource: ResourceRef,
) => PolicyResult;
