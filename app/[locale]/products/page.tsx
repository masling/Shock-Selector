import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/config";
import { getLocalizedAlternates } from "@/lib/seo";
import { getSiteCopy } from "@/lib/i18n/site-copy";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
};

export { default, dynamic } from "../../products/page";

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return {
    title: copy.metadata.productsTitle,
    alternates: getLocalizedAlternates(localeParam, "/products"),
  };
}
