# MVP Traceability Matrix

## Purpose

Cross-link audit: MVP epics → artifacts.

## Legend

✓ = documented and linked

| EPIC | Entities | States | Rules | Permissions | Flow | Screens | Procedures | Jobs/Events |
|------|----------|--------|-------|-------------|------|---------|------------|-------------|
| EPIC-001 | ENT-Tenant, ENT-TenantSubscription | — | — | platform matrix | 01 | SCR-platform-* | PROC-platform.* | EVT-TenantCreated |
| EPIC-002 | ENT-User, ENT-TenantMembership | portal-invites | — | auth | 02 | SCR-admin-login | PROC-auth.* | EVT-UserInvited |
| EPIC-003 | ENT-ImpersonationSession | impersonation | — | 07 | 11 | SCR-platform-impersonate | PROC-platform.start/end | EVT-ImpersonationStarted |
| EPIC-004 | ENT-Location, ENT-Resource | — | — | 06 | — | SCR-admin-settings-locations | PROC-location.* | — |
| EPIC-010 | ENT-Lead, ENT-Person | leads | 05 | CRM matrix | 03 | SCR-admin-lead-* | PROC-crm.* | EVT-LeadConverted |
| EPIC-011 | ENT-ImportJob | — | 08 | CRM matrix | 09 | SCR-admin-import | PROC-crm.import/merge | JOB-import |
| EPIC-012 | ENT-ConsentRecord | — | 06 | portal | 12 | SCR-portal-consent | PROC-portal.grantConsent | EVT-ConsentRecorded |
| EPIC-013 | ENT-AuditLogEntry | — | retention | GDPR | 13 | SCR-*-privacy | PROC-gdpr.* | JOB-gdpr-export |
| EPIC-015 | ENT-Document | — | — | docs | — | SCR-*-documents | PROC-document.* | EVT-DocumentUploaded |
| EPIC-020 | ENT-Enrollment, ENT-MemberProfile | enrollments | 04 | CRM | 04 | SCR-admin-enroll-* | PROC-enrollment.* | EVT-EnrollmentCreated |
| EPIC-022 | ENT-Offer, ENT-Session | sessions, offers | 03 | offers | 04 | SCR-admin-calendar | PROC-schedule.* | JOB-generate-sessions |
| EPIC-025 | ENT-Team, ENT-RosterEntry | — | — | club | 05 | SCR-admin-roster | PROC-club.*, PROC-attendance.* | EVT-AttendanceRecorded |
| EPIC-030 | ENT-Invoice, ENT-PaymentRecord | invoices, payments, dunning | 01, 02, 07 | billing | 06 | SCR-admin-billing-* | PROC-billing.* | JOB-recurring, JOB-dunning |
| EPIC-035 | read models | — | — | reports | — | SCR-admin-reports | aggregates | — |
| EPIC-040 | ENT-Person | portal-invites | — | portal matrix | 07 | SCR-portal-* | PROC-portal.* | EVT-PortalAccountActivated |
| EPIC-041 | ENT-Thread, ENT-Message | — | — | comms | 08 | SCR-*-messages | PROC-comms.*, WS | EVT-MessageSent |
| EPIC-042 | ENT-DeliveryAttempt | — | — | comms | — | SCR-admin-templates | email jobs | EVT-EmailBounced |
| EPIC-050 | ENT-BookingRequest | booking-requests | — | marketplace | 10 | SCR-marketplace-* | PROC-marketplace.* | EVT-BookingRequestSubmitted |

## Definition of done (documentation)

- [x] All MVP epics traced in this matrix
- [x] 72 screens in route map with individual specs
- [x] 12 ADRs (1 pending email provider)
- [x] 45+ entities in entity index
- [x] 12 state machines
- [x] 13 flows with diagrams
- [x] 55+ procedures catalogued
- [x] 26 events, 15 jobs
- [x] German DE docs archived to `_archive/de-v1/`

## Gaps (intentional)

- Email provider ADR-009 status Pending until vendor contract
- Some list/get tRPC procedures to add during implementation (~90 total)

## Glossary sync

All ENT-* in [00-overview/02-glossary.md](../00-overview/02-glossary.md). PROC-* and SCR-* indexed in README and route map / procedure catalog.
