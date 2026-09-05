import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/marketing/home-page";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedAlternates } from "@/lib/seo";
import { getHomePageCopy } from "@/lib/i18n/home-page-copy";

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

  const copy = getHomePageCopy(localeParam);

  return {
    title: copy.title.replace(/\n/g, " "),
    description: copy.description,
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
