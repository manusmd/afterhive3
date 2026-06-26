# Epics and User Stories

## Purpose

MVP backlog with acceptance criteria (export to Linear).

## SETUP-001: Monorepo + Docker + health checks

| Story | AC |
|-------|-----|
| SETUP-001 | Turborepo four apps + worker + packages; Docker Compose; Drizzle base; per-app health; MUI shells; policy skeleton — **Linear MAN-211** |

## EPIC-001: Platform tenant lifecycle

| Story | AC |
|-------|-----|
| US-001 Create tenant | Given platform admin, when create tenant with slug/name/owner email, then tenant exists, Stripe customer created, owner invite sent (SCR-platform-tenant-create, PROC-platform.createTenant) |
| US-002 List tenants | Filter by status/plan; pagination works (SCR-platform-tenants) |
| US-003 Suspend tenant | Suspended tenant cannot login to admin (PROC-platform.suspendTenant) |

## EPIC-002: Staff authentication

| Story | AC |
|-------|-----|
| US-010 Invite staff | Email sent; role + location scope saved (PROC-auth.inviteStaff) |
| US-011 Staff login | Valid credentials → session with correct locationIds (SCR-admin-login) |

## EPIC-003: Platform impersonation

| Story | AC |
|-------|-----|
| US-020 Start impersonation | Support enters reason; banner shown; audit logged (PROC-platform.startImpersonation) |
| US-021 Impersonation limits | Support cannot issue invoices while impersonating |

## EPIC-004: Multi-location

| Story | AC |
|-------|-----|
| US-030 Create locations | At least one location required (SCR-admin-settings-locations) |
| US-031 Location scoping | Office user with one location only sees that location's leads |

## EPIC-005: i18n foundation

| Story | AC |
|-------|-----|
| US-040 German UI | All MVP screens use i18n keys; default de — **Linear MAN-173** |

## EPIC-010: CRM leads

| Story | AC |
|-------|-----|
| US-100 Create lead | Lead appears in list with source/status (PROC-crm.createLead) — **Linear MAN-177** |
| US-101 Convert lead | Conversion creates person; lead status converted; history preserved (Flow 03) — **Linear MAN-178** |
| US-102 Lead pipeline | Status transitions follow state machine — **Linear MAN-179** |

## EPIC-011: Import export merge

| Story | AC |
|-------|-----|
| US-110 CSV import | Import job completes; errors reported per row (Flow 09) — **Linear MAN-180** |
| US-111 Merge persons | Duplicate merged; FKs repointed; audit entry — **Linear MAN-182** |

## EPIC-012: Guardian consent

| Story | AC |
|-------|-----|
| US-120 Minor block | Enrollment blocked until consent complete (Flow 12) |
| US-121 Portal consent | Guardian can grant via SCR-portal-consent |

## EPIC-013: GDPR

| Story | AC |
|-------|-----|
| US-130 Export | Export zip contains person data categories (Flow 13) |
| US-131 Anonymize | PII removed; invoices retained |

## EPIC-015: Documents

| Story | AC |
|-------|-----|
| US-150 Upload | File stored R2; metadata in DB |
| US-151 Portal download | Portal user downloads only allowed visibility |

## EPIC-020: Members enrollment

| Story | AC |
|-------|-----|
| US-200 Enroll member | Active enrollment when capacity; waitlist when full (Flow 04) |
| US-201 End enrollment | Capacity decremented; history kept |

## EPIC-022: Offers scheduling

| Story | AC |
|-------|-----|
| US-220 Create offer | Offer + group + recurrence generates sessions |
| US-221 Conflict detection | Staff double-book blocked server-side |

## EPIC-025: Club sport

| Story | AC |
|-------|-----|
| US-250 Team roster | Roster entries linked to members (SCR-admin-roster) |
| US-251 Attendance | Coach records bulk attendance on session (Flow 05) |

## EPIC-030: Billing

| Story | AC |
|-------|-----|
| US-300 Monthly tariff | Recurring job creates invoice with correct net/VAT/gross |
| US-301 Per session | Attendance triggers line items per rules |
| US-302 Mock payment | Payment succeeds; invoice marked paid (Flow 06) |
| US-303 Dunning | Overdue invoice creates dunning stage 1 email job |
| US-304 Season package custom | Each model produces correct totals per [05-business-rules/01](../05-business-rules/01-pricing-and-tariffs.md) |

## EPIC-035: Reports

| Story | AC |
|-------|-----|
| US-350 Member count | Report matches DB count |
| US-351 Revenue | Sums issued invoices in period |
| US-352 Attendance rate | Present / expected sessions |

## EPIC-040: Portal self-service

| Story | AC |
|-------|-----|
| US-400 Portal invite | User links to person; can edit profile (Flow 07) |
| US-401 View schedule | Sees own/children sessions only |
| US-402 View invoices | Sees payer-authorized invoices |

## EPIC-041: Chat

| Story | AC |
|-------|-----|
| US-410 Create thread | Portal user messages staff; WS delivers (Flow 08) |
| US-411 Staff reply | Two-way realtime under 2s LAN latency |

## EPIC-042: Email notifications

| Story | AC |
|-------|-----|
| US-420 Invite email | DeliveryAttempt recorded |
| US-421 Bounce handling | Bounce marks attempt failed |

## EPIC-050: Marketplace (spec; post-MVP build)

| Story | AC |
|-------|-----|
| US-500 Search | Public search returns published offers only |
| US-501 Booking request | Creates BookingRequest; tenant notified (Flow 10) |

**Total: 18 epics, ~45 stories listed** (expand to ~90 at sprint planning with list/detail/get stories)
