import { strToU8, zipSync } from "fflate";

export type PersonExportCategories = {
  profile: unknown;
  member: unknown;
  consent: unknown;
  relationships: unknown;
  leads: unknown;
};

export function buildPersonExportZip(categories: PersonExportCategories) {
  return zipSync({
    "profile.json": strToU8(JSON.stringify(categories.profile, null, 2)),
    "member.json": strToU8(JSON.stringify(categories.member, null, 2)),
    "consent.json": strToU8(JSON.stringify(categories.consent, null, 2)),
    "relationships.json": strToU8(JSON.stringify(categories.relationships, null, 2)),
    "leads.json": strToU8(JSON.stringify(categories.leads, null, 2)),
  });
}
