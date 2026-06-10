import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  isLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);

  return {
    title: {
      default: copy.metadata.defaultTitle,
      template: "%s | EKD",
    },
    description: copy.metadata.defaultDescription,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);

  return (
    <>
      <SiteHeader
        locale={locale}
        copy={copy.navigation}
        localeNames={copy.localeNames}
        mobileLabels={{ open: copy.navigation.mobileMenuOpen, close: copy.navigation.mobileMenuClose }}
      />
      <main>{children}</main>
      <SiteFooter locale={locale} copy={copy.footer} />
    </>
  );
}
