import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";
import { htmlLangByLocale, resolveLocale } from "@/lib/i18n/config";
import { getMetadataBase } from "@/lib/seo";

const googleAnalyticsId = "G-YVJYV2FPW3";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
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
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
      </body>
    </html>
  );
}
