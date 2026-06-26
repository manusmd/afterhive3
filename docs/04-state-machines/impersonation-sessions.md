# Impersonation Session State Machine

## Entity

ENT-ImpersonationSession

## States

`active` → `ended` | `expired`

## Transitions

| From | To | Guard |
|------|-----|-------|
| active | ended | Staff ends or target logout |
| active | expired | expires_at reached (max 1h) |

## Side effects

- Start: audit log; session banner
- End: audit log; restore actor session
