import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Afterhive Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
