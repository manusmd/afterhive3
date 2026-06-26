# CRM Domain

## Purpose

Leads, persons, households, relationships, customers, interactions, import.

## Scope

MVP full CRM including import/export and merge.

## Entities

### ENT-Lead

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| status | enum | yes | | yes | See state machine |
| source | enum | yes | | yes | `manual`,`web`,`marketplace`,`import`,`phone` |
| first_name | string | yes | | | |
| last_name | string | yes | | | |
| email | string | no | | yes | |
| phone | string | no | | | |
| assigned_to_user_id | UUID | no | | yes | Staff |
| location_id | UUID | no | | yes | |
| notes | text | no | | | |
| tags | string[] | no | | | |
| interested_offer_id | UUID | no | | | |
| converted_person_id | UUID | no | | | Set on conversion |
| converted_at | timestamptz | no | | | |
| last_activity_at | timestamptz | yes | | yes | |

### ENT-Person

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| first_name | string | yes | | yes | Meilisearch |
| last_name | string | yes | | yes | |
| email | string | no | | yes | |
| phone | string | no | | | |
| date_of_birth | date | no | | | Minor detection |
| gender | enum | no | | | Optional |
| address | jsonb | no | | | street, city, zip, country |
| household_id | UUID | no | | yes | Optional |
| user_id | UUID | no | | | Portal account link |
| search_document | tsvector | no | | GIN | Fallback search |

### ENT-Household

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| name | string | no | | | e.g. "Müller family" |
| primary_payer_person_id | UUID | no | | | |
| billing_email | string | no | | | |

### ENT-Relationship

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| from_person_id | UUID | yes | | yes | |
| to_person_id | UUID | yes | | yes | |
| type | enum | yes | | | `parent`,`guardian`,`emergency_contact`,`payer`,`sibling` |
| is_primary_guardian | boolean | yes | | | One primary per minor |

Unique: `(tenant_id, from_person_id, to_person_id, type)`

### ENT-CustomerProfile

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| person_id | UUID | no | | | XOR household |
| household_id | UUID | no | | | XOR person |
| customer_number | string | yes | tenant+number | yes | Sequential |
| status | enum | yes | | | `active`,`inactive` |

### ENT-ContactInteraction

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| lead_id | UUID | no | | | |
| person_id | UUID | no | | | |
| type | enum | yes | | | `note`,`call`,`email`,`meeting` |
| subject | string | no | | | |
| body | text | no | | | |
| created_by_user_id | UUID | yes | | | |

### ENT-ImportJob

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| entity_type | enum | yes | | | `lead`,`person` |
| status | enum | yes | | | `pending`,`processing`,`completed`,`failed` |
| file_document_id | UUID | yes | | | |
| mapping | jsonb | yes | | | Column map |
| result | jsonb | no | | | counts, errors |

## Relationships

- Lead 0:1 Person (after conversion)
- Person N:1 Household (optional)
- Person 1:0..1 CustomerProfile
- Person 1:N Relationship edges

## States

[04-state-machines/leads.md](../04-state-machines/leads.md)

## Invariants

- CustomerProfile: exactly one of person_id or household_id set
- Conversion preserves lead row; sets converted_person_id
- Merge: loser person soft-deleted; FKs repointed transactionally

## Permissions

[06-permissions/03-permission-matrix-tenant-admin.md](../06-permissions/03-permission-matrix-tenant-admin.md) CRM rows

## API procedures

`PROC-crm.createLead`, `PROC-crm.convertLead`, `PROC-crm.mergePersons`, `PROC-crm.importCsv`

## UI surfaces

`SCR-admin-crm-*`

## Events

`EVT-LeadCreated`, `EVT-LeadConverted`, `EVT-PersonMerged`, `EVT-ImportCompleted`

## Open questions

None.
