const LOCATION_NAME_MIN = 1;
const LOCATION_NAME_MAX = 255;

export type LocationNameValidationError = "empty" | "too_long";

export function normalizeLocationName(name: string) {
  return name.trim();
}

export function validateLocationName(name: string): LocationNameValidationError | null {
  const normalized = normalizeLocationName(name);

  if (normalized.length < LOCATION_NAME_MIN) {
    return "empty";
  }

  if (normalized.length > LOCATION_NAME_MAX) {
    return "too_long";
  }

  return null;
}
