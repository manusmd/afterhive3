# Communications

## Purpose

Email, in-app chat threads, templates, delivery tracking.

## Scope

MVP email + full two-way WebSocket chat.

## Entities

### ENT-Thread

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| type | enum | yes | | | `direct`,`support`,`enrollment` |
| subject | string | no | | | |
| linked_entity_type | string | no | | | polymorphic |
| linked_entity_id | UUID | no | | | |
| status | enum | yes | | | `open`,`closed` |
| assigned_to_user_id | UUID | no | | | Staff queue |

### ENT-ThreadParticipant

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| thread_id | UUID | yes | | yes | |
| user_id | UUID | yes | | | |
| role | enum | yes | | | `staff`,`portal` |
| last_read_at | timestamptz | no | | | |

### ENT-Message

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| thread_id | UUID | yes | | yes | |
| sender_user_id | UUID | yes | | | |
| body | text | yes | | | Plain + markdown subset |
| channel | enum | yes | | | `in_app`,`email` |
| created_at | timestamptz | yes | | yes | |

### ENT-MessageTemplate

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| key | string | yes | tenant+key | | |
| locale | string | yes | | | `de` |
| channel | enum | yes | | | `email` |
| subject | string | yes | | | Handlebars |
| body_html | text | yes | | | |
| version | int | yes | | | |

### ENT-DeliveryAttempt

| Field | Type | Required | Unique | Indexed | Notes |
|-------|------|----------|--------|---------|-------|
| id | UUID | yes | PK | yes | |
| tenant_id | UUID | yes | | yes | |
| message_id | UUID | no | | | |
| template_id | UUID | no | | | |
| recipient_email | string | yes | | | |
| status | enum | yes | | | `queued`,`sent`,`delivered`,`bounced`,`failed` |
| provider_message_id | string | no | | | |
| error | text | no | | | |

## Relationships

- Thread 1:N Message N:1 ThreadParticipant
- Template used by email jobs

## Invariants

- Portal users only see threads they participate in
- Email outbound creates DeliveryAttempt before send job
- Closed thread rejects new messages except staff reopen

## Permissions

See comms rows in permission matrices

## API procedures

`PROC-comms.sendMessage`, `PROC-comms.createThread`, WebSocket events

## UI surfaces

`SCR-admin-inbox`, `SCR-portal-messages`

## Events

`EVT-MessageSent`, `EVT-EmailBounced`

## Open questions

Email provider ADR-009 pending.
