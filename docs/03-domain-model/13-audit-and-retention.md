# Audit and Retention

## Purpose

Audit logs, consent records, data retention classes.

## Scope

MVP

## Entities

### ENT-AuditLogEntry

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | no | | yes | Null platform |
| actor_user_id | UUID | yes | | yes | |
| impersonator_user_id | UUID | no | | | |
| action | string | yes | | yes | Enum catalog |
| entity_type | string | yes | | | |
| entity_id | UUID | yes | | | |
| before | jsonb | no | | | Redacted |
| after | jsonb | no | | | Redacted |
| ip | string | no | | | |
| created_at | timestamptz | yes | | yes | |

### ENT-ConsentRecord

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| person_id | UUID | yes | | yes | Minor |
| guardian_person_id | UUID | yes | | | |
| type | enum | yes | | | `enrollment`,`portal`,`marketing`,`photo` |
| granted | boolean | yes | | | |
| granted_at | timestamptz | yes | | | |
| method | enum | yes | | | `portal_click`,`paper_upload` |
| document_id | UUID | no | | | Paper scan |

## Retention schedule

| Class | Examples | Retention |
|-------|----------|-----------|
| Financial | Invoices, payments | 10 years (DE) |
| Contract | Contracts | 10 years after end |
| CRM | Leads inactive | 2 years then anonymize |
| Chat | Messages | 3 years |
| Audit | AuditLogEntry | 7 years |
| Marketing consent | ConsentRecord | Until withdrawn + 3y |

## Invariants

- Audit entries append-only
- Delete person: anonymize PII, retain financial links

## Permissions

Audit read: tenant_owner, platform_support

## API procedures

`PROC-audit.query`, `PROC-gdpr.exportPerson`, `PROC-gdpr.anonymizePerson`

## Events

`EVT-ConsentRecorded`

## Open questions

Legal review of retention periods before launch.
