# Audit Log Schema

## Purpose

What gets audited and how.

## Entity

ENT-AuditLogEntry — see domain model

## Actions (enum)

`role.assign`, `role.revoke`, `impersonation.start`, `impersonation.end`, `invoice.issue`, `invoice.void`, `payment.record`, `person.merge`, `person.anonymize`, `gdpr.export`, `document.download`, `settings.update`, `tenant.suspend`, `consent.record`

## Redaction

- No passwords, full card numbers
- before/after: truncate strings >500 chars
- PII in audit: only ids + changed field names for bulk exports

## Retention

7 years — see [03-domain-model/13-audit-and-retention.md](../03-domain-model/13-audit-and-retention.md)

## Access

tenant_owner + platform_support read; append-only insert
