# Product Vision and Principles

## Purpose

Define what Afterhive is and the principles that govern product and engineering decisions.

## Scope

All phases; MVP emphasizes tenant admin + club/sport vertical.

## Vision

Afterhive is the operating system for providers of extracurricular programs: one system where operations, customer relationships, planning, communication, and billing converge. Long term: internal admin plus external portal and marketplace on the same data model—no patchwork of backoffice, portal, and third-party tools.

## Principles

1. **Member-centric** — Person in context of relationships, programs, contracts, history
2. **Core + verticals** — Shared identity and offers; verticals extend, never fork identity
3. **Visible billing in MVP** — Modeled even when payments are mock
4. **Equal individual and household paths** — No family-only assumptions
5. **Location-aware from MVP** — Multi-site tenants supported
6. **i18n-ready** — German MVP UI; keys from day one
7. **Policy-first security** — Authorization server-side, not UI-only

## Surfaces priority (implementation)

1. Tenant admin (MVP primary value)
2. Portal (self-service + chat)
3. Platform backoffice (full ops)
4. Marketplace (specified fully; build after core stable)

## Invariants

- No parallel member identity models per vertical
- Marketplace uses same offer/enrollment concepts as admin

## Open questions

None.
