# Patterns: Tables, Forms, Calendar, Chat

## Purpose

Interaction patterns for high-traffic UI.

## Data tables

- Server pagination via tRPC cursor
- Sticky header, column resize optional
- Row click → detail; checkbox bulk for export/delete
- Mobile: card list with primary fields

## Forms

- React Hook Form + Zod resolver
- Sectioned `Stack` with `Typography subtitle2`
- Unsaved changes dialog on navigate
- Domain wizards use `Stepper`

## Calendar

- Week default; resource lanes optional post-MVP
- Session chip color by status
- Click session → SCR-admin-session-detail
- Create via form modal (not drag MVP)

## Chat

- Split view: thread list | active thread
- Composer: multiline, send on Enter+Shift newline
- Typing indicator via WS
- Read receipts on message footer

## Invoice forms

- Line item editor table
- Live net/VAT/gross summary
- Issue confirmation shows PDF preview
