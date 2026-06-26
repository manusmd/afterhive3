# Flow: Lead to Member Conversion

## Purpose

Convert qualified lead to person/customer/member.

## Steps

```mermaid
flowchart TD
  A[Lead qualified] --> B[Open convert modal]
  B --> C{Create member?}
  C -->|Yes| D[Create Person + MemberProfile]
  C -->|No| E[Person only]
  D --> F{Create customer?}
  E --> F
  F -->|Yes| G[CustomerProfile]
  F -->|No| H[Skip billing]
  D --> I{Minor?}
  I -->|Yes| J[Require guardian + consent]
  I -->|No| K[Complete conversion]
  J --> K
  K --> L[Lead status converted]
```

## Procedures

`PROC-crm.convertLead`

## Screens

`SCR-admin-lead-detail`, `SCR-admin-convert-lead-modal`

## AC

EPIC-010
