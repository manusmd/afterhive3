import { MarketplaceThemeProvider } from "@afterhive/ui";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Afterhive Entdecken",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.className}>
      <body>
        <MarketplaceThemeProvider>{children}</MarketplaceThemeProvider>
      </body>
    </html>
  );
}
