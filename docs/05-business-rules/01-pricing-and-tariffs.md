# Pricing and Tariffs

## Purpose

Define five billing models with tariff config JSON and worked examples.

## Scope

MVP all models.

## Model: fixed_monthly

**Config:** `{ "amount_cents": number, "billing_day": 1-28 }`

### Examples

1. U12 team membership €45/month → `4500` cents, billing_day `1`
2. Adult fitness €60/month → `6000` cents
3. Sibling second member €35/month → custom contract override

**Invoice:** One line per month; service_period = calendar month.

## Model: per_session

**Config:** `{ "amount_cents": number, "bill_absent": false }`

### Examples

1. Training €15/session, bill only present → 8 sessions × €15 = €120 net
2. €20/session including excused absences → count present + excused
3. Drop-in €25 single session → manual line on invoice

**Invoice:** Generated after session completed or monthly batch from attendance.

## Model: package

**Config:** `{ "sessions_included": number, "amount_cents": number, "valid_days": number }`

### Examples

1. 10-session card €130 for 90 days
2. 20 sessions €240 valid 6 months
3. Package exhausted → per-session fallback tariff or staff alert

## Model: season

**Config:** `{ "amount_cents": number, "season_id": uuid }`

### Examples

1. Season 2025/26 U14 €320 flat
2. Summer camp 2 weeks €180
3. Pro-rated join mid-season: `(days_remaining / season_days) * amount` rounded to cent

## Model: custom

**Config:** `{ "description": string }` + `Contract.custom_amount_cents`

### Examples

1. Staff discount €30/month custom
2. Scholarship €0 with approval note
3. Corporate flat €500/month for group

## Invariants

- Tariff archived does not affect existing contract snapshots
- VAT applied per tariff.vat_rate unless kleinunternehmer (0% display note)

## API

`PROC-billing.previewInvoice`, `PROC-billing.generateRecurringInvoices`
