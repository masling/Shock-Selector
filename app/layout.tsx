import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import "./globals.css";
import { htmlLangByLocale, resolveLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: {
    default: "EKD | Industrial Shock Absorber Selection Platform",
    template: "%s | EKD",
  },
  description:
    "Find suitable industrial shock absorbers, heavy duty buffers and vibration isolation products with product discovery and sizing-first navigation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const headerStore = await headers();
  const locale = resolveLocale(headerStore.get("x-locale"));

  return (
    <html lang={htmlLangByLocale[locale]}>
      <body>{children}</body>
    </html>
  );
}
