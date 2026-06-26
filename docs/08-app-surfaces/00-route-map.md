# Route Map

## Purpose

Master index of all screens (SCR-*) by surface.

## Scope

MVP + marketplace spec

## Deployable apps

| Surface | App | Route prefix |
|---------|-----|--------------|
| Platform | `apps/platform` | `/platform` |
| Tenant admin | `apps/admin` | `/app/:tenantSlug` |
| Portal | `apps/portal` | `/portal/:tenantSlug` |
| Marketplace | `apps/marketplace` | `/discover` |

See [00-overview/04-app-surfaces-and-repo.md](../00-overview/04-app-surfaces-and-repo.md).

## Platform (`/platform`) — `apps/platform`

| ID | Route | Title |
|----|-------|-------|
| SCR-platform-login | /platform/login | Platform Login |
| SCR-platform-dashboard | /platform | Dashboard |
| SCR-platform-tenants | /platform/tenants | Tenant Directory |
| SCR-platform-tenant-detail | /platform/tenants/:id | Tenant Detail |
| SCR-platform-tenant-create | /platform/tenants/new | Create Tenant |
| SCR-platform-tenant-billing | /platform/tenants/:id/billing | Subscription Billing |
| SCR-platform-support | /platform/support | Support Queue |
| SCR-platform-audit | /platform/audit | Audit Log |
| SCR-platform-settings | /platform/settings | Settings |
| SCR-platform-impersonate-dialog | modal | Impersonation |

## Tenant admin (`/app/:tenantSlug`) — `apps/admin`

| ID | Route | Title |
|----|-------|-------|
| SCR-admin-login | /login | Admin Login |
| SCR-admin-onboarding | /onboarding | Onboarding |
| SCR-admin-dashboard | / | Dashboard |
| SCR-admin-leads | /crm/leads | Leads |
| SCR-admin-lead-detail | /crm/leads/:id | Lead Detail |
| SCR-admin-convert-lead-modal | modal | Convert Lead |
| SCR-admin-persons | /crm/persons | Persons |
| SCR-admin-person-detail | /crm/persons/:id | Person Detail |
| SCR-admin-person-privacy | /crm/persons/:id/privacy | Privacy |
| SCR-admin-households | /crm/households | Households |
| SCR-admin-household-detail | /crm/households/:id | Household |
| SCR-admin-members | /crm/members | Members |
| SCR-admin-member-detail | /crm/members/:id | Member Detail |
| SCR-admin-member-consent-status | /crm/members/:id/consent | Consent |
| SCR-admin-import | /crm/import | Import |
| SCR-admin-merge-modal | modal | Merge |
| SCR-admin-offers | /offers | Offers |
| SCR-admin-offer-detail | /offers/:id | Offer Detail |
| SCR-admin-offer-group | /offers/:id/groups/:gid | Offer Group |
| SCR-admin-enroll-modal | modal | Enroll |
| SCR-admin-calendar | /calendar | Calendar |
| SCR-admin-session-detail | /sessions/:id | Session |
| SCR-admin-waitlist | /waitlist | Waitlist |
| SCR-admin-club-departments | /club/departments | Departments |
| SCR-admin-club-teams | /club/teams | Teams |
| SCR-admin-roster | /club/teams/:id/roster | Roster |
| SCR-admin-trainer-assign | /club/trainers | Trainers |
| SCR-admin-billing-dashboard | /billing | Billing |
| SCR-admin-invoices | /billing/invoices | Invoices |
| SCR-admin-invoice-detail | /billing/invoices/:id | Invoice |
| SCR-admin-contracts | /billing/contracts | Contracts |
| SCR-admin-tariffs | /billing/tariffs | Tariffs |
| SCR-admin-dunning | /billing/dunning | Dunning |
| SCR-admin-inbox | /messages | Inbox |
| SCR-admin-thread | /messages/:threadId | Thread |
| SCR-admin-templates | /settings/templates | Templates |
| SCR-admin-settings | /settings | Settings |
| SCR-admin-settings-locations | /settings/locations | Locations |
| SCR-admin-settings-team | /settings/team | Team |
| SCR-admin-settings-branding | /settings/branding | Branding |
| SCR-admin-reports | /reports | Reports |
| SCR-admin-booking-requests | /marketplace/requests | Booking Requests |

**Count: 40**

## Portal (`/portal/:tenantSlug`) — `apps/portal`

| ID | Route | Title |
|----|-------|-------|
| SCR-portal-login | /login | Login |
| SCR-portal-invite | /invite/:token | Invite |
| SCR-portal-dashboard | / | Dashboard |
| SCR-portal-family | /family | Family |
| SCR-portal-bookings | /bookings | Bookings |
| SCR-portal-schedule | /schedule | Schedule |
| SCR-portal-invoices | /invoices | Invoices |
| SCR-portal-documents | /documents | Documents |
| SCR-portal-messages | /messages | Messages |
| SCR-portal-thread | /messages/:threadId | Thread |
| SCR-portal-profile | /profile | Profile |
| SCR-portal-requests | /requests | Requests |
| SCR-portal-consent | /consent | Consent |
| SCR-portal-privacy | /privacy | Privacy |

**Count: 14**

## Marketplace (`/discover`) — `apps/marketplace`

| ID | Route | Title |
|----|-------|-------|
| SCR-marketplace-home | /discover | Home |
| SCR-marketplace-search | /discover/search | Search |
| SCR-marketplace-provider | /discover/providers/:slug | Provider |
| SCR-marketplace-offer | /discover/offers/:slug | Offer |
| SCR-marketplace-slot-picker | /discover/offers/:slug/book | Slots |
| SCR-marketplace-booking-form | /discover/offers/:slug/request | Request |
| SCR-marketplace-booking-confirm | /discover/booking/:id/confirmation | Confirm |
| SCR-marketplace-categories | /discover/categories/:cat | Categories |

**Count: 8**

## Total screens: 72

Individual specs: `platform/`, `tenant-admin/`, `portal/`, `marketplace/` folders.

## Navigation defaults

| Surface | Landing after login |
|---------|---------------------|
| Platform | SCR-platform-dashboard |
| Admin | SCR-admin-dashboard |
| Portal | SCR-portal-dashboard |
| Marketplace | SCR-marketplace-home (no login) |
