# R2 Object Model

## Purpose

Storage key layout and access.

## Key pattern

`{tenant_id}/{category}/{entity_id}/{filename}`

Categories: `documents`, `invoices`, `imports`, `exports`, `gdpr`

## Example

`550e8400-e29b-41d4-a716-446655440000/invoices/inv-123/RE2025-00042.pdf`

## Access

1. Client requests PROC-document.getSignedUrl
2. Policy check on ENT-Document
3. Presigned GET 15 min TTL

## Upload

1. Client POST multipart to PROC-document.upload
2. Server streams to R2, creates ENT-Document
3. Return documentId

## Lifecycle

Soft delete document → delete object after 30 days retention job (post-MVP hard delete job)
