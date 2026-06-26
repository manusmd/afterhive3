# Tenant Admin Permission Matrix

## Purpose

Role × resource × action for tenant admin.

## Scope

MVP

## Legend

Y = allow, L = location-scoped, - = deny

## CRM

| Resource / Action | owner | admin | office | coach | finance | loc_mgr |
|-------------------|-------|-------|--------|-------|---------|---------|
| lead.read | Y | Y | L | - | L | L |
| lead.create | Y | Y | L | - | - | L |
| lead.convert | Y | Y | L | - | - | L |
| person.read | Y | Y | L | L* | L | L |
| person.update | Y | Y | L | - | - | L |
| person.merge | Y | Y | - | - | - | - |
| person.export | Y | Y | L | - | - | L |
| import.run | Y | Y | L | - | - | L |

*coach: persons on assigned teams/sessions only

## Offers & scheduling

| Resource | owner | admin | office | coach | finance | loc_mgr |
|----------|-------|-------|--------|-------|---------|---------|
| offer.read | Y | Y | L | L | L | L |
| offer.write | Y | Y | L | - | - | L |
| session.read | Y | Y | L | L | - | L |
| session.write | Y | Y | L | L** | - | L |
| attendance.write | Y | Y | L | L** | - | L |

**assigned sessions only

## Club

| Resource | owner | admin | office | coach | finance | loc_mgr |
|----------|-------|-------|--------|-------|---------|---------|
| team.read | Y | Y | L | L | - | L |
| roster.write | Y | Y | L | L** | - | L |
| trainer.assign | Y | Y | L | - | - | L |

## Billing

| Resource | owner | admin | office | coach | finance | loc_mgr |
|----------|-------|-------|--------|-------|---------|---------|
| invoice.read | Y | Y | L | - | Y | L |
| invoice.issue | Y | Y | - | - | Y | - |
| payment.record | Y | Y | - | - | Y | - |
| contract.write | Y | Y | - | - | Y | - |

## Comms

| Resource | owner | admin | office | coach | finance | loc_mgr |
|----------|-------|-------|--------|-------|---------|---------|
| thread.read | Y | Y | L | L | L | L |
| thread.write | Y | Y | L | L | - | L |
| template.write | Y | Y | - | - | - | - |

## Settings

| Resource | owner | admin | office | coach | finance | loc_mgr |
|----------|-------|-------|--------|-------|---------|---------|
| tenant.settings | Y | Y | - | - | - | - |
| location.write | Y | Y | - | - | - | L*** |
| role.assign | Y | Y | - | - | - | - |

***own location only
