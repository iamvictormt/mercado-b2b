import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import "@/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000"),
  title: {
    default: "Mercado B2B",
    template: "%s — Mercado B2B",
  },
  description: "Plataforma de compras empresariais em São Tomé e Príncipe.",
  authors: [{ name: "Mercado B2B" }],
  openGraph: { type: "website", siteName: "Mercado B2B" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
