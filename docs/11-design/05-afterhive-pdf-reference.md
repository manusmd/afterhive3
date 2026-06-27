# Afterhive PDF Design Reference

## Purpose

Visual source of truth for the Afterhive PDF design system alignment (EPIC-035).

## Reference files

| File | Description |
|------|-------------|
| [../design/Afterhive.pdf](../design/Afterhive.pdf) | Original shared mockup (tenant-admin dashboard) |
| [02-mui-theme-tokens.md](02-mui-theme-tokens.md) | Implemented MUI token mapping |

## PDF structure (tenant admin)

- **Sidebar:** Afterhive logo, grouped nav (`ÜBERSICHT`, `CRM`, `PROGRAMME`, `FINANZEN`, `ORGANISATION`), user footer
- **Top bar:** breadcrumb, global search (`⌘K`), utility icons
- **Dashboard:** greeting, quick actions, KPI stat cards, sessions list, tasks, hints

## Extracted tokens (dark admin)

| Token | Value | Usage |
|-------|-------|--------|
| `background.default` | `#0D0D0D` | Page canvas |
| `background.paper` | `#1A1A1A` | Cards, search field |
| Shell sidebar | `#141414` | Permanent drawer |
| `primary.main` | `#F5C518` | Primary actions, active nav, accents |
| `primary.contrastText` | `#0D0D0D` | Text on primary buttons |
| Secondary button | `#2A2A2A` | Outlined/secondary actions |
| `text.primary` | `#FAFAFA` | Headings, values |
| `text.secondary` | `#A1A1AA` | Meta, breadcrumbs, section labels |
| `success.main` | `#22C55E` | Positive KPI accents |
| `error.main` | `#EF4444` | Overdue / alerts |
| `info.main` | `#3B82F6` | Info / waitlist |
| Card radius | `12px` | Panels and stat cards |
| Drawer width | `280px` | Sidebar |
| Top bar height | `64px` | App bar |

## Linear tracking

- Epic: [MAN-213](https://linear.app/manuweb/issue/MAN-213)
- Ticket 1 (tokens): [MAN-214](https://linear.app/manuweb/issue/MAN-214)
