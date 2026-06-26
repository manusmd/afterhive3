# Logging Redaction Rules

## Purpose

Fields never logged in clear text.

## Redact list

- password, password_hash, token, session_id
- email (log hash only), phone
- date_of_birth
- medical_notes
- stripe full card data
- authorization headers

## Allowed

- tenant_id, user_id, entity ids, procedure names, duration_ms, error codes

## Implementation

Pino `redact` paths in logger config

## Audit vs logs

Audit store may retain actor + entity ids; not full PII dumps
