# MUI Theme Tokens

## Purpose

Theme structure for heavily customized MUI v9, aligned with [Afterhive.pdf](../design/Afterhive.pdf).

## Package

`packages/ui/src/theme/design-tokens.ts` → `base.ts` + surface overrides

## Afterhive brand

Platform chrome uses warm **gold/yellow** (`#F5C518` dark / `#CA8A04` light) from the PDF mockup. Per-tenant colors come later via `SCR-admin-settings-branding`.

## Color tokens

| Token | Dark | Light |
|-------|------|-------|
| background.default | #0D0D0D | #F4F4F5 |
| background.paper | #1A1A1A | #ffffff |
| primary.main | #F5C518 | #CA8A04 |
| primary.contrastText | #0D0D0D | #0D0D0D |
| secondary.main | #A1A1AA | #64748b |
| error.main | #EF4444 | #dc2626 |
| warning.main | #F5C518 | #CA8A04 |
| info.main | #3B82F6 | #2563EB |
| success.main | #22C55E | #16a34a |
| text.primary | #FAFAFA | #18181B |
| text.secondary | #A1A1AA | #71717A |
| divider | rgba(255,255,255,0.08) | rgba(0,0,0,0.08) |

## Shell tokens (admin/platform)

| Token | Dark | Light |
|-------|------|-------|
| sidebar | #141414 | #ffffff |
| searchBackground | #1A1A1A | #ffffff |
| navActiveBackground | rgba(245,197,24,0.12) | rgba(202,138,4,0.12) |
| secondaryButtonBackground | #2A2A2A | #F4F4F5 |

## Typography

- Font: `Inter` (Latin), `fallback system-ui`
- h1 2rem / h2 1.5rem / body1 0.875rem admin / 1rem portal
- Nav section labels: 0.6875rem uppercase, 0.08em tracking

## Shape

- borderRadius: 8 (controls)
- cardRadius: 12 (panels)
- chipRadius: 6

## Layout

- drawerWidth: 280
- topbarHeight: 64
- cardPadding: 20

## Components overrides

- `MuiButton`: no uppercase, gold primary, dark secondary surface
- `MuiDrawer`, `MuiAppBar`, `MuiListItemButton`: PDF shell styling
- `MuiPaper`: bordered cards with subtle shadow
- `MuiOutlinedInput`: search field styling
- `MuiTableCell`: padding compact in admin
- `MuiChip`: small, semibold

## Mode switch

User preference → `ThemeProvider` mode; persist ENT-UserPreference. Admin/platform default **dark** to match PDF.
