# Component Catalog

## Purpose

Layered component architecture.

## Layers

### Primitives (`packages/ui/primitives`)

Mui-wrapped: `Button`, `TextField`, `Select`, `Dialog`, `Drawer`, `Chip`, `Badge`, `Skeleton`

### Composite (`packages/ui/composite`)

- `DataTable` — filters, pagination, bulk actions, empty states
- `PageHeader` — title, breadcrumbs, actions
- `ConfirmDialog` — destructive confirm
- `EmptyState` — illustration + CTA
- `FilterBar` — location, date, search
- `SessionCalendar` — week/day views
- `ChatPanel` — thread + composer + WS hook
- `ImpersonationBanner` — platform support

### Domain (`packages/ui/domain`)

- `LeadConvertWizard` — multi-step conversion
- `EnrollmentModal` — capacity/waitlist UI
- `AttendanceGrid` — roster × status toggles
- `InvoicePreview` — DACH layout
- `ConsentForm` — guardian checks

## State requirements

Each composite documents loading, empty, error, filtered-empty per ADR-012
