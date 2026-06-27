const PAYMENT_RECORDERS = new Set(["tenant_owner", "tenant_admin", "tenant_finance"]);

export function canRecordPayment(roles: string[]) {
  return roles.some((role) => PAYMENT_RECORDERS.has(role));
}
