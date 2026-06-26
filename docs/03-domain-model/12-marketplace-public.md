# Marketplace (Public)

## Purpose

Public discovery, provider profiles, booking requests → lead/enrollment.

## Scope

Full spec; implementation after tenant admin stable.

## Entities

### ENT-ProviderProfile

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | unique | yes | |
| public_slug | string | yes | global | yes | SEO |
| display_name | string | yes | | | |
| description | text | no | | | |
| logo_document_id | UUID | no | | | |
| locations_summary | jsonb | no | | | Public addresses |
| published | boolean | yes | | yes | |

### ENT-PublicOfferProjection

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| offer_id | UUID | yes | unique | | |
| public_slug | string | yes | global | yes | |
| title | string | yes | | | Whitelist copy |
| description | text | no | | | |
| price_display | string | no | | | "ab 45 €/Monat" |
| location_id | UUID | yes | | | |
| age_range | string | no | | | |
| published | boolean | yes | | yes | |
| available_slots | int | no | | | Denormalized |

**Never expose:** internal notes, cost, staff names unless configured.

### ENT-BookingRequest

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| public_offer_projection_id | UUID | yes | | yes | |
| status | enum | yes | | yes | State machine |
| contact_first_name | string | yes | | | |
| contact_last_name | string | yes | | | |
| contact_email | string | yes | | | |
| contact_phone | string | no | | | |
| participant_dob | date | no | | | |
| preferred_slot | jsonb | no | | | |
| lead_id | UUID | no | | | Created on accept |
| enrollment_id | UUID | no | | | Direct enroll if configured |
| created_at | timestamptz | yes | | yes | |

## Relationships

- ProviderProfile 1:1 Tenant
- PublicOfferProjection N:1 Offer
- BookingRequest → Lead or Enrollment per tenant config

## States

[04-state-machines/booking-requests.md](../04-state-machines/booking-requests.md)

## Invariants

- Public APIs read-only except BookingRequest create
- Rate limit booking requests by IP
- PII in booking requests follows retention rules

## Permissions

Public create; tenant staff process

## API procedures

`PROC-marketplace.search`, `PROC-marketplace.submitBookingRequest`

## UI surfaces

`SCR-marketplace-*`

## Events

`EVT-BookingRequestSubmitted`, `EVT-BookingRequestAccepted`

## Open questions

None.
