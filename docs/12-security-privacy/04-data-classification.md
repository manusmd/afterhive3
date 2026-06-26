# Data Classification

## Purpose

Tiering for access, logging, retention.

## Tiers

| Tier | Examples | Access |
|------|----------|--------|
| T0 Public | Marketplace offer titles | Public |
| T1 Internal | Staff notes, internal docs | Staff roles |
| T2 Personal | Name, email, DOB, address | Scoped staff + portal self |
| T3 Sensitive | Medical notes, minors | Owner, admin, assigned coach read; no export in portal |
| T4 Financial | Invoices, payments | Finance, owner, portal payer views |
| T5 Auth | Sessions, tokens | System only |

## Logging

T3+ never in debug logs; see [13-observability/02-logging-redaction-rules.md](../13-observability/02-logging-redaction-rules.md)

## Encryption

TLS in transit; postgres volume encryption at rest (operator responsibility)
