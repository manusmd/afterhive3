# Guardian Consent for Minors

## Purpose

Rules for members under 18.

## Scope

MVP DACH

## Minor definition

`date_of_birth` → age < 18 at enrollment date.

## Required before enrollment active

1. At least one `Relationship` type guardian with `is_primary_guardian`
2. `ENT-ConsentRecord` type `enrollment` granted by guardian
3. For portal: consent type `portal` + guardian portal account or paper upload

## Flow

See [07-flows/12-guardian-consent-flow.md](../07-flows/12-guardian-consent-flow.md)

## Invariants

- Cannot set enrollment pending→active without consent_status complete on MemberProfile
- Photo/marketing consent separate optional records
