import { getPlatformAuth } from "@afterhive/api/auth/platform-auth";
import { getPlatformSessionContext } from "@afterhive/api/auth/get-platform-session";
import { createTranslator, DEFAULT_LOCALE, getMessages, translatePlatformRole } from "@afterhive/shared/i18n";
import { headers } from "next/headers";
import { buildPlatformNav } from "@/components/build-platform-nav";
import { PlatformChrome } from "@/components/PlatformChrome";

const t = createTranslator(getMessages(DEFAULT_LOCALE));
const hrefPrefix = process.env.BASE_PATH ?? "/platform";

type ShellLayoutProps = {
  children: React.ReactNode;
};

function deriveUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export default async function ShellLayout({ children }: ShellLayoutProps) {
  const requestHeaders = await headers();
  const authSession = await getPlatformAuth().api.getSession({ headers: requestHeaders });
  const session = await getPlatformSessionContext(requestHeaders);

  const userName = authSession?.user?.name ?? authSession?.user?.email ?? undefined;
  const userInitials = userName ? deriveUserInitials(userName) : undefined;
  const userRole = session?.roles[0] ? translatePlatformRole(t, session.roles[0]) : undefined;
  const navSections = session ? buildPlatformNav({ roles: session.roles, t }) : [];

  return (
    <PlatformChrome
      hrefPrefix={hrefPrefix}
      navSections={navSections}
      userName={userName}
      userRole={userRole}
      userInitials={userInitials}
    >
      {children}
    </PlatformChrome>
  );
}
