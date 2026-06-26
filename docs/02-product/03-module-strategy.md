# Module Strategy

## Purpose

Define activatable product modules and capabilities.

## Scope

MVP modules listed; tutoring slot reserved post-MVP.

## Modules

| Module ID | MVP | Capabilities |
|-----------|-----|--------------|
| `core` | Yes | CRM, persons, offers, scheduling, documents, base comms |
| `club_sport` | Yes | Departments, teams, roster, trainer assignment |
| `billing` | Yes | Contracts, tariffs, invoices, mock payments, dunning |
| `portal` | Yes | Self-service, chat |
| `marketplace` | Spec only | Public discovery, booking requests |
| `tutoring` | No | Subjects, goals, progress (future) |

## Activation

- Platform sets modules on `ENT-Tenant.modules` JSON array
- UI hides nav; **policies deny** API if module inactive
- Vertical data tables may exist empty when module off

## Pricing (platform)

Stripe B2B plans map to module bundles ([07-billing-platform.md](../03-domain-model/07-billing-platform.md)).

## Invariants

- `core` cannot be disabled while tenant active
- Vertical modules require `core`

## Open questions

None.
