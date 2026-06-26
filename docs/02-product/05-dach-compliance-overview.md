# DACH Compliance Overview

## Purpose

High-level compliance pointers; detail in business rules and security docs.

## Scope

DACH market; not legal advice.

## VAT / invoicing

- Tenant configures `ENT-Tenant.vatId`, legal name, address
- Invoice line items: net, VAT rate, gross; small business exemption flag (`Kleinunternehmer`)
- Required fields: [05-business-rules/07-vat-and-invoice-fields-dach.md](../05-business-rules/07-vat-and-invoice-fields-dach.md)

## GDPR

- Lawful bases: contract, consent (marketing, minors), legitimate interest (operational)
- DSAR: export + delete workflows [07-flows/13-data-subject-export-delete.md](../07-flows/13-data-subject-export-delete.md)
- Retention: [03-domain-model/13-audit-and-retention.md](../03-domain-model/13-audit-and-retention.md)

## Minors

- Guardian linking + `ENT-ConsentRecord` before enrollment ([05-business-rules/06-guardian-consent-minors.md](../05-business-rules/06-guardian-consent-minors.md))

## Platform vs tenant responsibility

| Data | Controller |
|------|------------|
| Tenant member/person data | Tenant (Afterhive processor) |
| Platform account/billing | Afterhive |

## Open questions

Legal review of terms/DPA before production launch (out of spec scope).
