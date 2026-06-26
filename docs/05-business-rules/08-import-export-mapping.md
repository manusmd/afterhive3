# Import and Export Mapping

## Purpose

CSV import/export column mappings.

## Scope

MVP full CRM

## Import (Lead, Person)

Required columns: `first_name`, `last_name`

Optional: `email`, `phone`, `date_of_birth`, `tags`, `source`, `location_code`

**Mapping UI:** Upload CSV → detect headers → user maps → preview 5 rows → ENT-ImportJob

**Validation:** Email format, DOB parse de-DE or ISO, duplicate warning

## Export

- Persons, Leads, Members: same columns + system ids
- UTF-8 BOM for Excel DE
- Filter by location, status, date range

## Errors

Row errors collected; partial import allowed with error report document

## API

`PROC-crm.importCsv`, `PROC-crm.exportCsv`

## Jobs

JOB-import-process on `imports` queue
