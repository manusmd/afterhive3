# VAT and Invoice Fields (DACH)

## Purpose

Required invoice fields for German-compliant invoices.

## Scope

MVP DE templates

## Tenant header (on every invoice PDF)

- legal_name, address, vat_id (if not Kleinunternehmer)
- Kleinunternehmer note per §19 UStG when applicable
- invoice_number, issue_date, due_date
- customer name + address

## Line items

- description, quantity, unit price net, VAT rate, line net, line VAT, line gross

## Totals

- net_total, vat breakdown by rate, gross_total

## Payment

- Bank details or "Zahlung per Überweisung" with reference = invoice_number

## Service period

- service_period_start/end when recurring (Leistungszeitraum)

## Example gross calc

Net €100 @ 19% → VAT €19 → Gross €119

## Invariants

- Currency EUR MVP
- Round per line to 2 decimals; sum must match totals ±1 cent tolerance adjusted on last line
