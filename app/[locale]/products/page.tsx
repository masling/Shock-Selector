import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsPageContent } from "@/components/products/products-page-content";
import { isLocale } from "@/lib/i18n/config";
import { getProductCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedAlternates } from "@/lib/seo";

type LocaleProductsPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocaleProductsPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = getProductCenterCopy(locale);

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: getLocalizedAlternates(locale, "/products"),
  };
}

export default async function LocaleProductsPage({ params }: LocaleProductsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProductsPageContent locale={locale} />;
}
