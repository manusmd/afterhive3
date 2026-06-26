# Open Risks

## Purpose

Tracked architectural and delivery risks.

| Risk | Impact | Mitigation |
|------|--------|------------|
| Core too abstract for Club/Sport | Vertical fights generic model | Offer/Team link explicit; roster on team not offer-only |
| Billing complexity | Schedule slip | Mock payments; all models specified with examples |
| Tenancy bugs | Critical privacy | RLS + integration tests + policy matrix |
| WebSocket on single server | Scale limit | Accept MVP; Redis pub/sub path documented |
| Meilisearch sync drift | Stale search | Reindex job; Postgres fallback |
| Email provider undecided | Block comms | ADR-009 Resend recommended; abstract interface |
| MUI v9 churn | UI rework | Pin version; theme isolation in packages/ui |
| Marketplace scope creep | Delays MVP | Spec complete but EPIC-050 last phase |
| Docker ops burden | Uptime | Backup doc; health checks; future cloud ADR |
| Minor consent legal | Compliance | Guardian flows mandatory; legal review pre-launch |
| German invoice errors | Legal/finance | Field checklist + PDF template review |
| Chat moderation | Safeguarding | Staff can close threads; audit messages |

## Review cadence

Revisit at end of each implementation phase.
