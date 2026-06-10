import { notFound } from "next/navigation";
import { ProductsPageContent } from "@/app/products/page";
import { isLocale } from "@/lib/i18n/config";

type LocaleProductsPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function LocaleProductsPage({ params }: LocaleProductsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProductsPageContent locale={locale} />;
}
