# Scheduling Conflicts

## Purpose

Server-side validation rules for sessions.

## Scope

MVP

## Conflict types

| Type | Severity | Rule |
|------|----------|------|
| Staff double-book | error | Same user_id overlapping sessions |
| Resource double-book | error | Same resource_id overlap |
| Location hours | warning | Outside location operating hours if configured |
| Member overlap | warning | Same member two enrollments same time |

## Resolution

- Errors block save
- Warnings require staff confirm with reason logged to audit

## Move session

- Check conflicts at new time
- Notify enrolled portal users if <24h notice (email job)

## API

`PROC-schedule.validateSession`, `PROC-schedule.moveSession`
