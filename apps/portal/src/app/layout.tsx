import { PortalI18nProvider } from "@/components/PortalI18nProvider";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const t = createTranslator(getMessages(DEFAULT_LOCALE));

export const metadata: Metadata = {
  title: t("portal.meta.title"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={DEFAULT_LOCALE} className={inter.className}>
      <body>
        <PortalI18nProvider>{children}</PortalI18nProvider>
      </body>
    </html>
  );
}
