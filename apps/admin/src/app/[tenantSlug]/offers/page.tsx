import { getAdminSessionContext } from "@afterhive/api/auth/get-admin-session";
import { canCreateOffer } from "@afterhive/api/offer/can-create-offer";
import { listOfferFormLocations } from "@afterhive/api/offer/create-offer";
import { listOffers } from "@afterhive/api/offer/list-offers";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Stack, Typography } from "@mui/material";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForbidden } from "@/components/SettingsForbidden";
import { StaffLogoutButton } from "@/components/StaffLogoutButton";
import { CreateOfferForm } from "./CreateOfferForm";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

type OffersPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function OffersPage({ params }: OffersPageProps) {
  const { tenantSlug } = await params;
  const session = await getAdminSessionContext(tenantSlug, await headers());

  if (!session) {
    redirect(`/${tenantSlug}/login`);
  }

  const pageTitle = t("admin.offers.title");

  if (!canCreateOffer(session.roles)) {
    return (
      <SurfaceShell surface="admin" title={pageTitle}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <StaffLogoutButton tenantSlug={tenantSlug} />
          </Stack>
          <SettingsForbidden tenantSlug={tenantSlug} title={pageTitle} />
        </Stack>
      </SurfaceShell>
    );
  }

  const locations = await listOfferFormLocations(session, tenantSlug);
  const offers = await listOffers(session, tenantSlug);

  return (
    <SurfaceShell surface="admin" title={pageTitle}>
      <Stack spacing={4}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Link href={`/${tenantSlug}`}>{t("admin.nav.dashboard")}</Link>
          <StaffLogoutButton tenantSlug={tenantSlug} />
        </Stack>

        <CreateOfferForm tenantSlug={tenantSlug} locations={locations} />

        <Stack spacing={2}>
          <Typography variant="h6">
            {t("admin.offers.list.title", { count: offers.length })}
          </Typography>
          {offers.length === 0 ? (
            <Typography color="text.secondary">{t("admin.offers.list.empty")}</Typography>
          ) : (
            offers.map((offer) => (
              <Typography key={offer.offerId}>
                {offer.name} · {offer.type} · {offer.status}
              </Typography>
            ))
          )}
        </Stack>
      </Stack>
    </SurfaceShell>
  );
}
