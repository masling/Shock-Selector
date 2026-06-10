import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsPageContent } from "@/components/products/products-page-content";
import { isLocale } from "@/lib/i18n/config";
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

  return {
    title: "Shock absorber and vibration isolation products",
    description: "Browse product families, technical series, model specifications, product features and application notes.",
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
