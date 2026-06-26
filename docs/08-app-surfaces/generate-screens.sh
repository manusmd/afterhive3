#!/bin/bash
# Generates screen spec markdown from route map entries
# Usage: ./generate-screens.sh

gen() {
  local id="$1" route="$2" surface="$3" roles="$4" title="$5" dir="$6"
  local file="$dir/${id}.md"
  cat > "$file" << EOF
# ${title}

## ID

${id}

## Route

\`${route}\`

## Surface

${surface}

## Roles

${roles}

## Layout sections

1. Page header with title and primary actions
2. Main content area
3. Optional sidebar filters

## Fields / content

See linked entities and procedures in route map.

## Primary actions

Domain actions per ${title} — see PROC catalog.

## Secondary actions

Export, filter, navigate related records where applicable.

## States

- Loading: skeleton per MUI patterns
- Empty: illustrated empty with CTA
- Error: inline alert + retry

## Mobile

Responsive stack; tables become card lists on xs breakpoint.

## Permissions

See permission matrix for ${surface}.

## Procedures

See [09-api-and-events/02-procedure-catalog.md](../../09-api-and-events/02-procedure-catalog.md)

EOF
}

BASE="/Users/manuel/dev/afterhive3/docs/08-app-surfaces"

# Platform
gen SCR-platform-login "/platform/login" platform "public" "Platform Login" "$BASE/platform"
gen SCR-platform-dashboard "/platform" "platform" "superadmin,support,finance" "Platform Dashboard" "$BASE/platform"
gen SCR-platform-tenants "/platform/tenants" platform "superadmin,support,finance" "Tenant Directory" "$BASE/platform"
gen SCR-platform-tenant-detail "/platform/tenants/:id" platform "superadmin,support,finance" "Tenant Detail" "$BASE/platform"
gen SCR-platform-tenant-create "/platform/tenants/new" platform "superadmin" "Create Tenant" "$BASE/platform"
gen SCR-platform-tenant-billing "/platform/tenants/:id/billing" platform "superadmin,finance" "Tenant Subscription Billing" "$BASE/platform"
gen SCR-platform-support "/platform/support" platform "support,superadmin" "Support Queue" "$BASE/platform"
gen SCR-platform-audit "/platform/audit" platform "superadmin,support,finance" "Platform Audit Log" "$BASE/platform"
gen SCR-platform-settings "/platform/settings" platform "superadmin" "Platform Settings" "$BASE/platform"
gen SCR-platform-impersonate-dialog "modal" platform "support,superadmin" "Impersonation Dialog" "$BASE/platform"

# Admin - dashboard & crm
gen SCR-admin-login "/app/:tenantSlug/login" tenant_admin "public" "Admin Login" "$BASE/tenant-admin"
gen SCR-admin-onboarding "/app/:tenantSlug/onboarding" tenant_admin "owner,admin" "Tenant Onboarding Wizard" "$BASE/tenant-admin"
gen SCR-admin-dashboard "/app/:tenantSlug" tenant_admin "all staff" "Dashboard" "$BASE/tenant-admin"
gen SCR-admin-leads "/app/:tenantSlug/crm/leads" tenant_admin "owner,admin,office" "Lead List" "$BASE/tenant-admin"
gen SCR-admin-lead-detail "/app/:tenantSlug/crm/leads/:id" tenant_admin "owner,admin,office" "Lead Detail" "$BASE/tenant-admin"
gen SCR-admin-convert-lead-modal "modal" tenant_admin "owner,admin,office" "Convert Lead Modal" "$BASE/tenant-admin"
gen SCR-admin-persons "/app/:tenantSlug/crm/persons" tenant_admin "owner,admin,office,coach" "Person List" "$BASE/tenant-admin"
gen SCR-admin-person-detail "/app/:tenantSlug/crm/persons/:id" tenant_admin "owner,admin,office" "Person Detail" "$BASE/tenant-admin"
gen SCR-admin-person-privacy "/app/:tenantSlug/crm/persons/:id/privacy" tenant_admin "owner,admin" "Person Privacy DSAR" "$BASE/tenant-admin"
gen SCR-admin-households "/app/:tenantSlug/crm/households" tenant_admin "owner,admin,office" "Household List" "$BASE/tenant-admin"
gen SCR-admin-household-detail "/app/:tenantSlug/crm/households/:id" tenant_admin "owner,admin,office" "Household Detail" "$BASE/tenant-admin"
gen SCR-admin-members "/app/:tenantSlug/crm/members" tenant_admin "owner,admin,office,coach" "Member List" "$BASE/tenant-admin"
gen SCR-admin-member-detail "/app/:tenantSlug/crm/members/:id" tenant_admin "owner,admin,office,coach" "Member Detail" "$BASE/tenant-admin"
gen SCR-admin-member-consent-status "/app/:tenantSlug/crm/members/:id/consent" tenant_admin "owner,admin,office" "Member Consent Status" "$BASE/tenant-admin"
gen SCR-admin-import "/app/:tenantSlug/crm/import" tenant_admin "owner,admin,office" "CSV Import" "$BASE/tenant-admin"
gen SCR-admin-merge-modal "modal" tenant_admin "owner,admin" "Merge Persons Modal" "$BASE/tenant-admin"

# Offers & scheduling
gen SCR-admin-offers "/app/:tenantSlug/offers" tenant_admin "owner,admin,office" "Offer List" "$BASE/tenant-admin"
gen SCR-admin-offer-detail "/app/:tenantSlug/offers/:id" tenant_admin "owner,admin,office" "Offer Detail" "$BASE/tenant-admin"
gen SCR-admin-offer-group "/app/:tenantSlug/offers/:id/groups/:gid" tenant_admin "owner,admin,office" "Offer Group Detail" "$BASE/tenant-admin"
gen SCR-admin-enroll-modal "modal" tenant_admin "owner,admin,office" "Enrollment Modal" "$BASE/tenant-admin"
gen SCR-admin-calendar "/app/:tenantSlug/calendar" tenant_admin "owner,admin,office,coach" "Calendar" "$BASE/tenant-admin"
gen SCR-admin-session-detail "/app/:tenantSlug/sessions/:id" tenant_admin "owner,admin,office,coach" "Session Detail" "$BASE/tenant-admin"
gen SCR-admin-waitlist "/app/:tenantSlug/waitlist" tenant_admin "owner,admin,office" "Waitlist" "$BASE/tenant-admin"

# Club
gen SCR-admin-club-departments "/app/:tenantSlug/club/departments" tenant_admin "owner,admin,office,coach" "Departments" "$BASE/tenant-admin"
gen SCR-admin-club-teams "/app/:tenantSlug/club/teams" tenant_admin "owner,admin,office,coach" "Teams" "$BASE/tenant-admin"
gen SCR-admin-roster "/app/:tenantSlug/club/teams/:id/roster" tenant_admin "owner,admin,office,coach" "Team Roster" "$BASE/tenant-admin"
gen SCR-admin-trainer-assign "/app/:tenantSlug/club/trainers" tenant_admin "owner,admin,office" "Trainer Assignments" "$BASE/tenant-admin"

# Billing
gen SCR-admin-billing-dashboard "/app/:tenantSlug/billing" tenant_admin "owner,admin,finance" "Billing Dashboard" "$BASE/tenant-admin"
gen SCR-admin-invoices "/app/:tenantSlug/billing/invoices" tenant_admin "owner,admin,finance" "Invoice List" "$BASE/tenant-admin"
gen SCR-admin-invoice-detail "/app/:tenantSlug/billing/invoices/:id" tenant_admin "owner,admin,finance" "Invoice Detail" "$BASE/tenant-admin"
gen SCR-admin-contracts "/app/:tenantSlug/billing/contracts" tenant_admin "owner,admin,finance" "Contracts" "$BASE/tenant-admin"
gen SCR-admin-tariffs "/app/:tenantSlug/billing/tariffs" tenant_admin "owner,admin,finance" "Tariffs" "$BASE/tenant-admin"
gen SCR-admin-dunning "/app/:tenantSlug/billing/dunning" tenant_admin "owner,admin,finance" "Dunning Cases" "$BASE/tenant-admin"

# Comms & settings
gen SCR-admin-inbox "/app/:tenantSlug/messages" tenant_admin "all staff" "Message Inbox" "$BASE/tenant-admin"
gen SCR-admin-thread "/app/:tenantSlug/messages/:threadId" tenant_admin "all staff" "Message Thread" "$BASE/tenant-admin"
gen SCR-admin-templates "/app/:tenantSlug/settings/templates" tenant_admin "owner,admin" "Message Templates" "$BASE/tenant-admin"
gen SCR-admin-settings "/app/:tenantSlug/settings" tenant_admin "owner,admin" "Settings Overview" "$BASE/tenant-admin"
gen SCR-admin-settings-locations "/app/:tenantSlug/settings/locations" tenant_admin "owner,admin,loc_mgr" "Locations" "$BASE/tenant-admin"
gen SCR-admin-settings-team "/app/:tenantSlug/settings/team" tenant_admin "owner,admin" "Team & Roles" "$BASE/tenant-admin"
gen SCR-admin-settings-branding "/app/:tenantSlug/settings/branding" tenant_admin "owner,admin" "Branding" "$BASE/tenant-admin"
gen SCR-admin-reports "/app/:tenantSlug/reports" tenant_admin "owner,admin,finance" "Reports" "$BASE/tenant-admin"
gen SCR-admin-booking-requests "/app/:tenantSlug/marketplace/requests" tenant_admin "owner,admin,office" "Booking Requests" "$BASE/tenant-admin"

# Portal
gen SCR-portal-login "/portal/:tenantSlug/login" portal "public" "Portal Login" "$BASE/portal"
gen SCR-portal-invite "/portal/:tenantSlug/invite/:token" portal "public" "Portal Invite Accept" "$BASE/portal"
gen SCR-portal-dashboard "/portal/:tenantSlug" portal "portal roles" "Portal Dashboard" "$BASE/portal"
gen SCR-portal-family "/portal/:tenantSlug/family" portal "parent" "Family Members" "$BASE/portal"
gen SCR-portal-bookings "/portal/:tenantSlug/bookings" portal "parent,adult_member" "Bookings" "$BASE/portal"
gen SCR-portal-schedule "/portal/:tenantSlug/schedule" portal "parent,adult_member" "Schedule" "$BASE/portal"
gen SCR-portal-invoices "/portal/:tenantSlug/invoices" portal "parent,self_payer,adult" "Invoices" "$BASE/portal"
gen SCR-portal-documents "/portal/:tenantSlug/documents" portal "parent,adult_member" "Documents" "$BASE/portal"
gen SCR-portal-messages "/portal/:tenantSlug/messages" portal "all portal" "Messages List" "$BASE/portal"
gen SCR-portal-thread "/portal/:tenantSlug/messages/:threadId" portal "all portal" "Message Thread" "$BASE/portal"
gen SCR-portal-profile "/portal/:tenantSlug/profile" portal "all portal" "Profile Edit" "$BASE/portal"
gen SCR-portal-requests "/portal/:tenantSlug/requests" portal "all portal" "Service Requests" "$BASE/portal"
gen SCR-portal-consent "/portal/:tenantSlug/consent" portal "parent" "Guardian Consent" "$BASE/portal"
gen SCR-portal-privacy "/portal/:tenantSlug/privacy" portal "all portal" "Privacy & DSAR" "$BASE/portal"

# Marketplace
gen SCR-marketplace-home "/discover" marketplace "public" "Marketplace Home" "$BASE/marketplace"
gen SCR-marketplace-search "/discover/search" marketplace "public" "Search Results" "$BASE/marketplace"
gen SCR-marketplace-provider "/discover/providers/:slug" marketplace "public" "Provider Profile" "$BASE/marketplace"
gen SCR-marketplace-offer "/discover/offers/:slug" marketplace "public" "Public Offer Detail" "$BASE/marketplace"
gen SCR-marketplace-slot-picker "/discover/offers/:slug/book" marketplace "public" "Slot Picker" "$BASE/marketplace"
gen SCR-marketplace-booking-form "/discover/offers/:slug/request" marketplace "public" "Booking Request Form" "$BASE/marketplace"
gen SCR-marketplace-booking-confirm "/discover/booking/:id/confirmation" marketplace "public" "Booking Confirmation" "$BASE/marketplace"
gen SCR-marketplace-categories "/discover/categories/:cat" marketplace "public" "Category Browse" "$BASE/marketplace"

echo "Generated screen specs"
