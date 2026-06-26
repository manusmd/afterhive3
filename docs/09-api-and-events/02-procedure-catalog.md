# Procedure Catalog

## Purpose

Use-case tRPC procedures (PROC-*).

## Format

`PROC-{domain}.{action}` → `router.path`

---

## auth.*

| ID | Procedure | Input summary | Output |
|----|-----------|---------------|--------|
| PROC-auth.login | tenant.auth.login | email, password, tenantSlug | session |
| PROC-auth.inviteStaff | tenant.auth.inviteStaff | email, roles, locationIds | membershipId |
| PROC-auth.invitePortalUser | tenant.auth.invitePortalUser | personId, role | inviteUrl |
| PROC-auth.acceptInvite | auth.acceptInvite | token, password? | session |
| PROC-auth.completeOnboarding | tenant.onboarding.complete | settings | void |

## platform.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-platform.createTenant | platform.tenant.create | name, slug, planId, ownerEmail | tenantId |
| PROC-platform.listTenants | platform.tenant.list | filters, cursor | tenants |
| PROC-platform.suspendTenant | platform.tenant.suspend | tenantId, reason | void |
| PROC-platform.startImpersonation | platform.impersonate.start | membershipId, reason | session |
| PROC-platform.endImpersonation | platform.impersonate.end | | void |
| PROC-platform.createSubscription | platform.billing.createSubscription | tenantId, planId | subscriptionId |

## crm.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-crm.createLead | tenant.crm.lead.create | lead fields | leadId |
| PROC-crm.updateLead | tenant.crm.lead.update | id, fields | lead |
| PROC-crm.convertLead | tenant.crm.lead.convert | id, options | personId |
| PROC-crm.createPerson | tenant.crm.person.create | person fields | personId |
| PROC-crm.updatePerson | tenant.crm.person.update | id, fields | person |
| PROC-crm.mergePersons | tenant.crm.person.merge | winnerId, loserId | personId |
| PROC-crm.importCsv | tenant.crm.import.start | mapping, documentId | jobId |
| PROC-crm.exportCsv | tenant.crm.export | entityType, filters | documentId |
| PROC-crm.search | tenant.crm.search | query, types | results |

## enrollment.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-enrollment.enroll | tenant.enrollment.create | memberId, offerGroupId | enrollmentId |
| PROC-enrollment.end | tenant.enrollment.end | id, reason | void |
| PROC-waitlist.promoteNext | tenant.waitlist.promote | offerGroupId | waitlistEntryId |

## offer.* / schedule.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-offer.create | tenant.offer.create | offer fields | offerId |
| PROC-offer.publish | tenant.offer.publish | offerId | void |
| PROC-schedule.setRecurrence | tenant.schedule.recurrence.set | offerGroupId, rrule | ruleId |
| PROC-schedule.generateSessions | tenant.schedule.generate | offerGroupId, range | count |
| PROC-schedule.moveSession | tenant.schedule.session.move | sessionId, startsAt | session |
| PROC-schedule.cancelSession | tenant.schedule.session.cancel | sessionId, reason | void |
| PROC-schedule.validateSession | tenant.schedule.session.validate | session fields | conflicts |
| PROC-attendance.recordBulk | tenant.attendance.recordBulk | sessionId, records[] | void |

## club.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-club.createDepartment | tenant.club.department.create | name, locationId | id |
| PROC-club.createTeam | tenant.club.team.create | departmentId, offerId | teamId |
| PROC-club.updateRoster | tenant.club.roster.update | teamId, entries[] | void |
| PROC-club.assignTrainer | tenant.club.trainer.assign | teamId/sessionId, userId | id |

## billing.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-billing.createTariff | tenant.billing.tariff.create | model, config | tariffId |
| PROC-billing.createContract | tenant.billing.contract.create | customerId, tariffId | contractId |
| PROC-billing.issueInvoiceDraft | tenant.billing.invoice.draft | customerId, lines? | invoiceId |
| PROC-billing.issueInvoice | tenant.billing.invoice.issue | invoiceId | invoice |
| PROC-billing.recordMockPayment | tenant.billing.payment.mock | invoiceId, amount | paymentId |
| PROC-billing.previewInvoice | tenant.billing.invoice.preview | contractId, period | preview |
| PROC-billing.generateRecurringInvoices | tenant.billing.invoice.recurring | period | jobId |

## comms.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-comms.createThread | tenant.comms.thread.create | participants, subject | threadId |
| PROC-comms.sendMessage | tenant.comms.message.send | threadId, body | messageId |
| PROC-comms.listThreads | tenant.comms.thread.list | cursor | threads |

## document.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-document.upload | tenant.document.upload | file, metadata | documentId |
| PROC-document.getSignedUrl | tenant.document.url | documentId | url |

## portal.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-portal.updateProfile | portal.profile.update | fields | person |
| PROC-portal.submitRequest | portal.request.submit | type, payload | requestId |
| PROC-portal.grantConsent | portal.consent.grant | type, personId | consentId |

## marketplace.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-marketplace.search | marketplace.search | query, filters | offers |
| PROC-marketplace.getOffer | marketplace.offer.get | publicSlug | projection |
| PROC-marketplace.submitBookingRequest | marketplace.booking.submit | form | requestId |

## gdpr.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-gdpr.exportPerson | tenant.gdpr.export | personId | jobId |
| PROC-gdpr.anonymizePerson | tenant.gdpr.anonymize | personId | void |

## location.*

| ID | Procedure | Input | Output |
|----|-----------|-------|--------|
| PROC-location.create | tenant.location.create | fields | locationId |
| PROC-resource.create | tenant.resource.create | locationId, fields | resourceId |

**Total: ~55 core procedures** (expand with list/get variants ~90 at implementation)
