import type { TenantStatus } from "./list-tenants";

export type SuspendTenantBlockReason = "already_suspended" | "already_closed";

export function getSuspendTenantBlockReason(
  status: TenantStatus,
): SuspendTenantBlockReason | null {
  switch (status) {
    case "suspended":
      return "already_suspended";
    case "closed":
      return "already_closed";
    case "trial":
    case "active":
      return null;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
