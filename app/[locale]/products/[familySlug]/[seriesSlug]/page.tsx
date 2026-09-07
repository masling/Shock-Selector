import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductSeriesPageContent } from "@/components/products/product-series-page-content";
import { findCatalogSeriesBySlug } from "@/lib/catalog/catalog-repository";
import { isLocale } from "@/lib/i18n/config";
import { getProductCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedAlternates } from "@/lib/seo";
import { getSeriesEditorial } from "@/lib/catalog/series-editorial";

type LocaleProductSeriesPageProps = {
  params: Promise<{ locale: string; familySlug: string; seriesSlug: string }>;
  searchParams?: Promise<{ model?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocaleProductSeriesPageProps): Promise<Metadata> {
  const { locale, familySlug, seriesSlug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const series = await findCatalogSeriesBySlug(familySlug, seriesSlug);
  const copy = getProductCenterCopy(locale);
  const editorial = series ? getSeriesEditorial(series.code, locale) : null;

  return {
    title: editorial?.name ?? (series ? `${series.name} ${series.code} ${copy.seriesSuffix}` : seriesSlug),
    description: editorial?.overview ?? series?.overview ?? undefined,
    alternates: getLocalizedAlternates(locale, `/products/${familySlug}/${seriesSlug}`),
  };
}

export default async function LocaleProductSeriesPage({ params, searchParams }: LocaleProductSeriesPageProps) {
  const { locale, familySlug, seriesSlug } = await params;
  const query = searchParams ? await searchParams : {};

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProductSeriesPageContent familySlug={familySlug} seriesSlug={seriesSlug} locale={locale} selectedModel={query.model} />;
}
