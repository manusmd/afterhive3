import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import { SurfaceShell } from "@afterhive/ui";
import { Typography } from "@mui/material";
import Link from "next/link";

const t = createTranslator(getMessages(DEFAULT_LOCALE));

export default function AdminHomePage() {
  const demoLink = "/app/demo-club/login";
  const hint = t("admin.home.demoHint", { link: demoLink });
  const [before, after] = hint.split(demoLink);

  return (
    <SurfaceShell surface="admin" title={t("admin.home.title")}>
      <Typography color="text.secondary">
        {before}
        <Link href={demoLink}>{demoLink}</Link>
        {after}
      </Typography>
    </SurfaceShell>
  );
}
