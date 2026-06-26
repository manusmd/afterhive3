# Invoicing and Dunning

## Purpose

Invoice generation rules and dunning schedule.

## Scope

MVP

## Generation triggers

| Trigger | Rule |
|---------|------|
| Monthly batch | 1st of month, all active fixed_monthly contracts |
| Session batch | Weekly job for per_session unpaid attendance |
| Manual | Staff creates draft for ad-hoc |
| Enrollment | Season/package on enrollment active |

## Number sequences

Format: `{prefix}{year}-{seq:5}` e.g. `RE2025-00042`; per tenant config in settings.

## Dunning

See [04-state-machines/dunning.md](../04-state-machines/dunning.md). Templates: `dunning_1`, `dunning_2`, `dunning_3`.

## Partial payments

Apply to oldest open invoice first (FIFO) unless staff allocates.

## Credit notes

Post-MVP; MVP: cancel draft or admin manual adjustment line on new invoice.

## Invariants

- Issued invoice immutable
- due_date = issue_date + payment_terms_days (default 14)
