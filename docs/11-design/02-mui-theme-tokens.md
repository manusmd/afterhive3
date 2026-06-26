# MUI Theme Tokens

## Purpose

Theme structure for heavily customized MUI v9.

## Package

`packages/ui/theme/base.ts` + surface overrides

## Color tokens (dark admin example)

| Token | Dark | Light |
|-------|------|-------|
| background.default | #0a0a0b | #fafafa |
| background.paper | #141416 | #ffffff |
| primary.main | #5b8def | #2563eb |
| secondary.main | #94a3b8 | #64748b |
| error.main | #ef4444 | #dc2626 |
| success.main | #22c55e | #16a34a |
| divider | rgba(255,255,255,0.08) | rgba(0,0,0,0.08) |

## Typography

- Font: `Inter` (Latin), `fallback system-ui`
- h1 2rem / h2 1.5rem / body1 0.875rem admin / 1rem portal

## Shape

- borderRadius: 8 (admin), 12 (portal)

## Components overrides

- `MuiButton`: no uppercase, fontWeight 600
- `MuiDataGrid`: row height 40 admin
- `MuiTableCell`: padding compact in admin

## Mode switch

User preference → `ThemeProvider` mode; persist ENT-UserPreference
