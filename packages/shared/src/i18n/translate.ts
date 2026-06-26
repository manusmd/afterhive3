import type { Messages } from "./index";

export const DEFAULT_LOCALE = "de";

export type TranslateValues = Record<string, string | number>;

export function createTranslator(messages: Messages) {
  return function translate(key: string, values?: TranslateValues): string {
    const resolved = resolveKey(messages, key);
    if (resolved === undefined) {
      return key;
    }
    if (!values) {
      return resolved;
    }
    return resolved.replace(/\{(\w+)\}/g, (_, name: string) =>
      name in values ? String(values[name]) : `{${name}}`,
    );
  };
}

function resolveKey(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}
