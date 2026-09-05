import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsPageContent } from "@/components/products/products-page-content";
import { isLocale } from "@/lib/i18n/config";
import { getProductCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedAlternates } from "@/lib/seo";
import { parseDirectorySearch, type DirectorySearchParams } from "@/lib/catalog/directory-search";

type LocaleProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<DirectorySearchParams>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: LocaleProductsPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = getProductCenterCopy(locale);
  const search = parseDirectorySearch(searchParams ? await searchParams : {});

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: getLocalizedAlternates(locale, "/products"),
    ...(search.query ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function LocaleProductsPage({ params, searchParams }: LocaleProductsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProductsPageContent locale={locale} searchParams={searchParams ? await searchParams : {}} />;
}
