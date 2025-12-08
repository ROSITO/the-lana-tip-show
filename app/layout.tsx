import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Lana Tip Show",
  description: "Application de gestion de points pour Lana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

