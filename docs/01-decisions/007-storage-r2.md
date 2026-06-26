# ADR-007: Object Storage — Cloudflare R2

## Status

Accepted

## Context

Documents, uploads, generated PDFs (invoices). S3-compatible API.

## Decision

- **Provider:** Cloudflare R2
- **Access:** Presigned URLs; max TTL 15 minutes
- **Metadata in Postgres:** `ENT-Document` with `storage_key`, never public bucket URLs
- **Max upload:** 25 MB MVP; MIME allowlist in domain rules

## Consequences

- Worker generates PDFs → upload to R2 → link on `ENT-Document`
- See [10-data-and-infra/03-r2-object-model.md](../10-data-and-infra/03-r2-object-model.md)

## Related

- [03-domain-model/09-documents.md](../03-domain-model/09-documents.md)
