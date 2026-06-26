# Domain Events

## Purpose

Internal domain events (EVT-*) for decoupling.

## Transport

MVP: in-process event bus → BullMQ enqueue. Payload JSON schema in `packages/shared/events`.

## Catalog

| ID | Payload | Producers | Consumers |
|----|---------|-----------|-----------|
| EVT-TenantCreated | tenantId | createTenant | seed, audit |
| EVT-UserInvited | userId, tenantId | invite | email job |
| EVT-LeadCreated | leadId | createLead | search index |
| EVT-LeadConverted | leadId, personId | convertLead | audit |
| EVT-PersonMerged | winnerId, loserId | merge | search |
| EVT-EnrollmentCreated | enrollmentId | enroll | billing, email |
| EVT-EnrollmentEnded | enrollmentId | end | capacity |
| EVT-OfferPublished | offerId | publish | marketplace index |
| EVT-SessionScheduled | sessionId | generate | notify |
| EVT-SessionCanceled | sessionId | cancel | notify job |
| EVT-AttendanceRecorded | sessionId | attendance | billing batch |
| EVT-InvoiceIssued | invoiceId | issue | pdf job, email |
| EVT-InvoicePaid | invoiceId | payment | dunning resolve |
| EVT-PaymentRecorded | paymentId | payment | invoice update |
| EVT-DunningStageAdvanced | caseId, stage | dunning job | email |
| EVT-WaitlistPromoted | entryId | promote | email |
| EVT-MessageSent | messageId | send | websocket push |
| EVT-EmailBounced | attemptId | webhook | CRM flag |
| EVT-DocumentUploaded | documentId | upload | audit |
| EVT-ConsentRecorded | consentId | consent | enrollment unlock |
| EVT-ImportCompleted | jobId | import | notify staff |
| EVT-BookingRequestSubmitted | requestId | marketplace | notify tenant |
| EVT-BookingRequestAccepted | requestId | staff | lead/enroll |
| EVT-ImpersonationStarted | sessionId | impersonate | audit |
| EVT-PortalAccountActivated | userId | acceptInvite | email |
| EVT-TenantSubscriptionUpdated | subscriptionId | stripe webhook | module sync |

## Ordering

Per-aggregate sequential processing via queue partition key `{tenantId}:{entityType}:{entityId}`.
