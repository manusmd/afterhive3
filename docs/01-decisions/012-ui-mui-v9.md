# ADR-012: UI — Heavily Customized MUI v9

## Status

Accepted

## Context

Three surfaces with different density: dense admin, airy portal, narrative marketplace. Dark/light required.

## Decision

- **Library:** MUI v9 (Material UI latest major)
- **Styling:** CSS theme variables + `theme.components` overrides; minimal one-off `sx`
- **Density:** `comfortable` admin tables, `standard` forms; portal +8px vertical rhythm
- **Icons:** Material Symbols Outlined
- **Data grid:** MUI X Data Grid for admin lists
- **Date/calendar:** MUI X Date Pickers + custom session calendar composite
- **No second component library** in MVP

## Theme structure

- `packages/ui/theme/admin.ts`, `portal.ts`, `marketplace.ts` extend shared `base.ts`
- Mode: `light` | `dark` persisted per user in `ENT-UserPreference`

## Consequences

- Screen specs reference MUI component names
- See [11-design/](../11-design/)

## Related

- [08-app-surfaces/00-route-map.md](../08-app-surfaces/00-route-map.md)
