import { PortalThemeProvider } from "@afterhive/ui";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Afterhive Portal",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.className}>
      <body>
        <PortalThemeProvider>{children}</PortalThemeProvider>
      </body>
    </html>
  );
}
