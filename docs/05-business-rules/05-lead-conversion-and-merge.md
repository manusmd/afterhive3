# Lead Conversion and Merge

## Purpose

Lead conversion and duplicate person merge.

## Scope

MVP

## Conversion (PROC-crm.convertLead)

Input options:

- `createPerson`: always true
- `createCustomer`: boolean
- `createMember`: boolean
- `linkHouseholdId`: optional
- `relationships`: optional guardian edges

**Steps (transaction):**

1. Create ENT-Person from lead fields
2. Optionally ENT-CustomerProfile, ENT-MemberProfile
3. Set lead status converted, converted_person_id
4. Copy contact interactions to person
5. EVT-LeadConverted

## Merge (PROC-crm.mergePersons)

- `winnerId`, `loserId`
- Repoint all FKs from loser to winner
- Soft-delete loser person
- Audit before/after
- Block if both have conflicting customer_numbers

## Duplicate detection

Match score: email exact OR (name + DOB) OR phone exact; threshold configurable.
