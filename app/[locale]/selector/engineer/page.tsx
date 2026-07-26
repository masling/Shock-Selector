import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EngineerSizingPageContent } from "@/components/selector/engineer-page-content";
import { isLocale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedAlternates } from "@/lib/seo";

type LocaleEngineerPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleEngineerPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = getSiteCopy(locale);
  return {
    title: copy.metadata.engineerTitle,
    description: copy.engineer.description,
    alternates: getLocalizedAlternates(locale, "/selector/engineer"),
  };
}

export default async function LocaleEngineerSizingPage({ params }: LocaleEngineerPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <EngineerSizingPageContent locale={locale} />;
}
