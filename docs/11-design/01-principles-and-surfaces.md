# Design Principles and Surfaces

## Purpose

UI direction for MUI v9 across surfaces.

## Principles

- Dark-first admin; light default portal; marketplace narrative light
- Afterhive platform primary: warm gold (`#CA8A04` light / `#F5C518` dark) per [Afterhive.pdf](../design/Afterhive.pdf)
- Information density over decoration
- Status always visible (badges, chips)
- Consistent empty/loading/error patterns

## Surface defaults

| Surface | Density | Max content width | Nav |
|---------|---------|-------------------|-----|
| Admin | compact | fluid | permanent drawer |
| Portal | comfortable | 960px | top bar + bottom nav mobile |
| Marketplace | spacious | 1200px | public header |
| Platform | compact | fluid | drawer |

## Accessibility

WCAG 2.1 AA target; MUI focus rings; calendar keyboard nav

## Related

[02-mui-theme-tokens.md](02-mui-theme-tokens.md)
