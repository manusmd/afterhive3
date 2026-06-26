# i18n and Locale

## Purpose

Internationalization strategy: German MVP UI with i18n-ready implementation.

## Scope

All user-facing surfaces.

## Decision

| Aspect | MVP | Future |
|--------|-----|--------|
| Default locale | `de` | `en` second |
| Library | `next-intl` (or equivalent) in each surface app under `apps/{platform,admin,portal,marketplace}`; shared catalogs in `packages/shared` | |
| Keys | `surface.section.key` e.g. `admin.crm.leads.title` | |
| Dates | `Intl.DateTimeFormat('de-DE')` | Per-user locale |
| Numbers | `de-DE` decimal comma | |
| Currency | EUR `formatCurrency(cents)` | Multi-currency post-MVP |
| Invoices | German legal text templates in `de` only MVP | |

## Content not i18n in MVP

- Developer docs (English)
- Audit log action codes (English enum)
- API error codes (English)

## Email templates

Stored with `locale` field; MVP only `de` templates seeded.

## User preference

`ENT-UserPreference.locale`: `de` | `en` (en falls back to de keys if missing)

## Invariants

- No hardcoded German in components; only in seed/template data marked `locale: de`

## Open questions

None.
