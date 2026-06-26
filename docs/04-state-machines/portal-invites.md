# Portal Invite State Machine

## Entity

ENT-TenantMembership (portal path)

## States

`invited` → `active` | `expired`

## Transitions

| From | To | Guard |
|------|-----|-------|
| invited | active | User completes signup/magic link |
| invited | expired | 7 days TTL; resend creates new invite |

## Side effects

- active: link user to person_id; EVT-PortalAccountActivated
