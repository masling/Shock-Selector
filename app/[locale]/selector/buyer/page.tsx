import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyerQuickFilterPageContent } from "@/components/selector/buyer-page-content";
import { isLocale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedAlternates } from "@/lib/seo";

type LocaleBuyerPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocaleBuyerPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = getSiteCopy(locale);
  return {
    title: copy.metadata.buyerTitle,
    description: copy.buyer.description,
    alternates: getLocalizedAlternates(locale, "/selector/buyer"),
  };
}

export default async function LocaleBuyerQuickFilterPage({ params }: LocaleBuyerPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <BuyerQuickFilterPageContent locale={locale} />;
}
