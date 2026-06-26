import type {
  Action,
  PolicyHandler,
  PolicyResult,
  ResourceRef,
  SessionContext,
} from "./types";

const handlers: PolicyHandler[] = [];

export function registerPolicy(handler: PolicyHandler): void {
  handlers.push(handler);
}

export function can(
  ctx: SessionContext,
  action: Action,
  resource: ResourceRef,
): PolicyResult {
  for (const handler of handlers) {
    const result = handler(ctx, action, resource);
    if (!result.allowed) {
      return result;
    }
  }
  return { allowed: false, reason: "no_matching_policy" };
}

export function resetPolicies(): void {
  handlers.length = 0;
}
