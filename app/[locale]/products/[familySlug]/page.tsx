import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductFamilyPageContent } from "@/components/products/product-family-page-content";
import { getCatalogTranslation } from "@/lib/catalog/catalog-i18n";
import { findCatalogFamilyBySlug } from "@/lib/catalog/catalog-repository";
import { isLocale } from "@/lib/i18n/config";
import { getLocalizedAlternates } from "@/lib/seo";

type LocaleProductFamilyPageProps = {
  params: Promise<{ locale: string; familySlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocaleProductFamilyPageProps): Promise<Metadata> {
  const { locale, familySlug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const family = await findCatalogFamilyBySlug(familySlug, locale);
  const translation = family ? getCatalogTranslation(family.translations, locale) : null;

  return {
    title: translation?.name ?? familySlug,
    description: translation?.summary ?? translation?.description,
    alternates: getLocalizedAlternates(locale, `/products/${familySlug}`),
  };
}

export default async function LocaleProductFamilyPage({ params }: LocaleProductFamilyPageProps) {
  const { locale, familySlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProductFamilyPageContent familySlug={familySlug} locale={locale} />;
}
