import { AdminThemeProvider } from "@afterhive/ui";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Afterhive Admin",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={inter.className}>
      <body>
        <AdminThemeProvider>{children}</AdminThemeProvider>
      </body>
    </html>
  );
}
