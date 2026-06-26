import pino from "pino";

export type LogContext = {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  surface?: string;
};

export function createLogger(name: string, context: LogContext = {}) {
  return pino({
    name,
    level: process.env.LOG_LEVEL ?? "info",
    base: context,
  });
}

export const rootLogger = createLogger("afterhive");
