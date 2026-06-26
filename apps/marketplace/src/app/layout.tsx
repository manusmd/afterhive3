import { MarketplaceI18nProvider } from "@/components/MarketplaceI18nProvider";
import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const t = createTranslator(getMessages(DEFAULT_LOCALE));

export const metadata: Metadata = {
  title: t("marketplace.meta.title"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={DEFAULT_LOCALE} className={inter.className}>
      <body>
        <MarketplaceI18nProvider>{children}</MarketplaceI18nProvider>
      </body>
    </html>
  );
}
