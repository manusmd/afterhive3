# Documents

## Purpose

File metadata and access control for uploads and generated PDFs.

## Scope

MVP

## Entities

### ENT-Document

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| storage_key | string | yes | | | R2 path |
| filename | string | yes | | | |
| mime_type | string | yes | | | Allowlist |
| size_bytes | int | yes | | | |
| sha256 | string | yes | | | |
| linked_entity_type | string | no | | | person, lead, invoice... |
| linked_entity_id | UUID | no | | | |
| visibility | enum | yes | | | `internal`,`portal`,`both` |
| uploaded_by_user_id | UUID | yes | | | |
| deleted_at | timestamptz | no | | | Soft delete |

## MIME allowlist (MVP)

`application/pdf`, `image/jpeg`, `image/png`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

## Invariants

- Max 25 MB per file
- Portal download requires visibility portal|both + policy check
- Invoice PDFs visibility both

## Permissions

Document access follows linked entity permissions

## API procedures

`PROC-document.upload`, `PROC-document.getSignedUrl`

## Events

`EVT-DocumentUploaded`

## Open questions

None.
