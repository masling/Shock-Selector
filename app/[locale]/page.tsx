import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/marketing/home-page";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedAlternates } from "@/lib/seo";

type LocaleHomePageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LocaleHomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);

  return {
    title: copy.metadata.homeTitle,
    description: copy.metadata.defaultDescription,
    alternates: getLocalizedAlternates(localeParam, ""),
  };
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  return <HomePage locale={localeParam as Locale} />;
}
