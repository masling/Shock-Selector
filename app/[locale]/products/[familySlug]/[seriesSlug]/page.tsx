import { notFound } from "next/navigation";
import { ProductSeriesPageContent } from "@/app/products/[familySlug]/[seriesSlug]/page";
import { isLocale } from "@/lib/i18n/config";

type LocaleProductSeriesPageProps = {
  params: Promise<{ locale: string; familySlug: string; seriesSlug: string }>;
  searchParams?: Promise<{ model?: string }>;
};

export const dynamic = "force-dynamic";

export default async function LocaleProductSeriesPage({ params, searchParams }: LocaleProductSeriesPageProps) {
  const { locale, familySlug, seriesSlug } = await params;
  const query = searchParams ? await searchParams : {};

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProductSeriesPageContent familySlug={familySlug} seriesSlug={seriesSlug} locale={locale} selectedModel={query.model} />;
}
