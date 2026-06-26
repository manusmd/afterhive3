# Capacity and Waitlist

## Purpose

Enrollment capacity and waitlist promotion.

## Scope

MVP

## Rules

1. `enrolled_count` = count enrollments status active for offer_group
2. Enroll when `enrolled_count < capacity`
3. When full and waitlist_enabled: create WaitlistEntry position = max+1
4. On enrollment end: auto-promote waitlist position 1 to offered
5. Offered TTL 48h then expire → promote next

## Fairness

FIFO by requested_at; staff may reorder with audit.

## API

`PROC-enrollment.enroll`, `PROC-waitlist.promoteNext`
