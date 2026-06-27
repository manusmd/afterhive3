import { createTranslator, DEFAULT_LOCALE, getMessages } from "@afterhive/shared/i18n";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PlatformI18nProvider } from "@/components/PlatformI18nProvider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const t = createTranslator(getMessages(DEFAULT_LOCALE));

export const metadata: Metadata = {
  title: t("platform.meta.title"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.className} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript defaultMode="dark" />
        <PlatformI18nProvider>{children}</PlatformI18nProvider>
      </body>
    </html>
  );
}
