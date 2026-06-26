# Entity Index

## Purpose

Master index of all domain entities with IDs and owning module.

## Scope

MVP + marketplace spec entities.

## Entity catalog

| ID | Entity | Table | Scope | Doc |
|----|--------|-------|-------|-----|
| ENT-Tenant | Tenant | `tenants` | Platform | [01-identity-and-access.md](01-identity-and-access.md) |
| ENT-User | User | `users` | Global | [01-identity-and-access.md](01-identity-and-access.md) |
| ENT-TenantMembership | TenantMembership | `tenant_memberships` | Tenant | [01-identity-and-access.md](01-identity-and-access.md) |
| ENT-RoleAssignment | RoleAssignment | `role_assignments` | Tenant | [01-identity-and-access.md](01-identity-and-access.md) |
| ENT-UserPreference | UserPreference | `user_preferences` | User | [01-identity-and-access.md](01-identity-and-access.md) |
| ENT-Lead | Lead | `leads` | Tenant | [02-crm.md](02-crm.md) |
| ENT-Person | Person | `persons` | Tenant | [02-crm.md](02-crm.md) |
| ENT-Household | Household | `households` | Tenant | [02-crm.md](02-crm.md) |
| ENT-Relationship | Relationship | `relationships` | Tenant | [02-crm.md](02-crm.md) |
| ENT-CustomerProfile | CustomerProfile | `customer_profiles` | Tenant | [02-crm.md](02-crm.md) |
| ENT-ContactInteraction | ContactInteraction | `contact_interactions` | Tenant | [02-crm.md](02-crm.md) |
| ENT-MemberProfile | MemberProfile | `member_profiles` | Tenant | [03-member-and-enrollment.md](03-member-and-enrollment.md) |
| ENT-Enrollment | Enrollment | `enrollments` | Tenant | [03-member-and-enrollment.md](03-member-and-enrollment.md) |
| ENT-Offer | Offer | `offers` | Tenant | [04-offers-and-scheduling.md](04-offers-and-scheduling.md) |
| ENT-OfferGroup | OfferGroup | `offer_groups` | Tenant | [04-offers-and-scheduling.md](04-offers-and-scheduling.md) |
| ENT-Season | Season | `seasons` | Tenant | [04-offers-and-scheduling.md](04-offers-and-scheduling.md) |
| ENT-Session | Session | `sessions` | Tenant | [04-offers-and-scheduling.md](04-offers-and-scheduling.md) |
| ENT-RecurrenceRule | RecurrenceRule | `recurrence_rules` | Tenant | [04-offers-and-scheduling.md](04-offers-and-scheduling.md) |
| ENT-Resource | Resource | `resources` | Tenant | [10-locations-and-resources.md](10-locations-and-resources.md) |
| ENT-SessionStaffAssignment | SessionStaffAssignment | `session_staff_assignments` | Tenant | [04-offers-and-scheduling.md](04-offers-and-scheduling.md) |
| ENT-AttendanceRecord | AttendanceRecord | `attendance_records` | Tenant | [05-attendance-and-waitlist.md](05-attendance-and-waitlist.md) |
| ENT-WaitlistEntry | WaitlistEntry | `waitlist_entries` | Tenant | [05-attendance-and-waitlist.md](05-attendance-and-waitlist.md) |
| ENT-Contract | Contract | `contracts` | Tenant | [06-billing-tenant.md](06-billing-tenant.md) |
| ENT-Tariff | Tariff | `tariffs` | Tenant | [06-billing-tenant.md](06-billing-tenant.md) |
| ENT-Invoice | Invoice | `invoices` | Tenant | [06-billing-tenant.md](06-billing-tenant.md) |
| ENT-InvoiceLineItem | InvoiceLineItem | `invoice_line_items` | Tenant | [06-billing-tenant.md](06-billing-tenant.md) |
| ENT-PaymentRecord | PaymentRecord | `payment_records` | Tenant | [06-billing-tenant.md](06-billing-tenant.md) |
| ENT-DunningCase | DunningCase | `dunning_cases` | Tenant | [06-billing-tenant.md](06-billing-tenant.md) |
| ENT-TenantSubscription | TenantSubscription | `tenant_subscriptions` | Platform | [07-billing-platform.md](07-billing-platform.md) |
| ENT-Thread | Thread | `threads` | Tenant | [08-communications.md](08-communications.md) |
| ENT-Message | Message | `messages` | Tenant | [08-communications.md](08-communications.md) |
| ENT-MessageTemplate | MessageTemplate | `message_templates` | Tenant | [08-communications.md](08-communications.md) |
| ENT-DeliveryAttempt | DeliveryAttempt | `delivery_attempts` | Tenant | [08-communications.md](08-communications.md) |
| ENT-Document | Document | `documents` | Tenant | [09-documents.md](09-documents.md) |
| ENT-Location | Location | `locations` | Tenant | [10-locations-and-resources.md](10-locations-and-resources.md) |
| ENT-Department | Department | `departments` | Tenant | [11-vertical-club-sport.md](11-vertical-club-sport.md) |
| ENT-Team | Team | `teams` | Tenant | [11-vertical-club-sport.md](11-vertical-club-sport.md) |
| ENT-RosterEntry | RosterEntry | `roster_entries` | Tenant | [11-vertical-club-sport.md](11-vertical-club-sport.md) |
| ENT-TrainerAssignment | TrainerAssignment | `trainer_assignments` | Tenant | [11-vertical-club-sport.md](11-vertical-club-sport.md) |
| ENT-PublicOfferProjection | PublicOfferProjection | `public_offer_projections` | Tenant | [12-marketplace-public.md](12-marketplace-public.md) |
| ENT-ProviderProfile | ProviderProfile | `provider_profiles` | Tenant | [12-marketplace-public.md](12-marketplace-public.md) |
| ENT-BookingRequest | BookingRequest | `booking_requests` | Tenant/Market | [12-marketplace-public.md](12-marketplace-public.md) |
| ENT-ConsentRecord | ConsentRecord | `consent_records` | Tenant | [13-audit-and-retention.md](13-audit-and-retention.md) |
| ENT-AuditLogEntry | AuditLogEntry | `audit_log_entries` | Tenant/Platform | [13-audit-and-retention.md](13-audit-and-retention.md) |
| ENT-ImportJob | ImportJob | `import_jobs` | Tenant | [02-crm.md](02-crm.md) |
| ENT-ImpersonationSession | ImpersonationSession | `impersonation_sessions` | Platform | [01-identity-and-access.md](01-identity-and-access.md) |

## Common columns (tenant-scoped)

All tenant tables include:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | yes | PK |
| tenant_id | UUID | yes | FK → tenants |
| created_at | timestamptz | yes | |
| updated_at | timestamptz | yes | |
| deleted_at | timestamptz | no | Soft delete where noted |

## Diagram

[diagrams/core-er.mmd](diagrams/core-er.mmd)
