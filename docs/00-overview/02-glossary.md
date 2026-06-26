# Glossary

Alphabetical reference. Entity IDs: `ENT-*`. Procedure IDs: `PROC-*`. Screen IDs: `SCR-*`.

## A

**Actor** — User or system principal performing an action in a given surface (platform, tenant admin, portal, marketplace).

**AttendanceRecord** (`ENT-AttendanceRecord`) — Record of a member's presence at a specific session.

**AuditLogEntry** (`ENT-AuditLogEntry`) — Immutable log of a sensitive action.

## B

**Better Auth** — Session-based authentication library (ADR-003).

**BookingRequest** (`ENT-BookingRequest`) — Marketplace submission that creates a lead or enrollment.

**BullMQ** — Redis-backed job queue (ADR-006).

## C

**Club/Sport vertical** — Module extending core with departments, teams, rosters, trainer assignments.

**ConsentRecord** (`ENT-ConsentRecord`) — Proof of guardian or data-processing consent.

**Contract** (`ENT-Contract`) — Tenant-side agreement linking customer to tariff and billing terms.

**CustomerProfile** (`ENT-CustomerProfile`) — Billing-oriented view of a person or household.

## D

**Department** (`ENT-Department`) — Club/Sport organizational unit (e.g. football, gymnastics).

**DunningCase** (`ENT-DunningCase`) — Escalation case for overdue invoices.

## E

**Enrollment** (`ENT-Enrollment`) — Assignment of a member to an offer instance or group/slot.

## G

**Guardian** — Person with legal/care relationship to a minor member (via `ENT-Relationship`).

## H

**Household** (`ENT-Household`) — Optional grouping of persons (family, payers, emergency contacts).

## I

**Invoice** (`ENT-Invoice`) — Tenant-issued bill with line items and status.

## L

**Lead** (`ENT-Lead`) — Pre-customer CRM contact.

**Location** (`ENT-Location`) — Physical site within a tenant; scopes permissions and scheduling.

## M

**Member** / **MemberProfile** (`ENT-MemberProfile`) — Participation-oriented view of a person in programs.

**Module** — Product capability bundle (core, club_sport, billing, portal, marketplace).

## O

**Offer** (`ENT-Offer`) — Generic program template (course, team, workshop, subscription).

**OfferGroup** (`ENT-OfferGroup`) — Instance: time, capacity, staff, location for an offer.

## P

**PaymentRecord** (`ENT-PaymentRecord`) — Stripe-shaped payment or mock payment record.

**Person** (`ENT-Person`) — Master identity data within a tenant.

**PortalUser** — User account with portal roles for a tenant (may overlap staff user).

**PublicOfferProjection** (`ENT-PublicOfferProjection`) — Whitelisted public view of an offer.

## R

**Relationship** (`ENT-Relationship`) — Edge between persons (parent, guardian, emergency contact, payer).

**RosterEntry** (`ENT-RosterEntry`) — Member assigned to a team for a season/period.

## S

**Session** (`ENT-Session`) — Scheduled occurrence (training, class); holds attendance.

**Stripe B2B** — Platform billing: tenant subscription to Afterhive.

**Surface** — One of platform, tenant admin, portal, marketplace.

## T

**Tariff** (`ENT-Tariff`) — Price rule set (monthly, per-session, package, season, custom).

**Team** (`ENT-Team`) — Club/Sport unit within a department.

**Tenant** (`ENT-Tenant`) — Organization on the platform.

**Thread** (`ENT-Thread`) — Conversation container for in-app chat.

**TrainerAssignment** (`ENT-TrainerAssignment`) — Staff linked to team or session.

## V

**Vertical** — Industry extension module (Club/Sport in MVP).

## W

**WaitlistEntry** (`ENT-WaitlistEntry`) — Queue position when offer group is at capacity.

## ID prefixes (cross-reference)

| Prefix | Catalog |
|--------|---------|
| ENT- | [03-domain-model/00-entity-index.md](../03-domain-model/00-entity-index.md) |
| PROC- | [09-api-and-events/02-procedure-catalog.md](../09-api-and-events/02-procedure-catalog.md) |
| SCR- | [08-app-surfaces/00-route-map.md](../08-app-surfaces/00-route-map.md) |
| EVT- | [09-api-and-events/03-domain-events.md](../09-api-and-events/03-domain-events.md) |
| JOB- | [09-api-and-events/04-background-jobs.md](../09-api-and-events/04-background-jobs.md) |
| EPIC- / US- | [14-delivery/02-epics-and-stories.md](../14-delivery/02-epics-and-stories.md) |
