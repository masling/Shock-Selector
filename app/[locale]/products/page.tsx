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
  const title =
    copy.navigation.items.find((item) => item.href === "/products")?.label ?? "Products";

  return {
    title,
    alternates: getLocalizedAlternates(localeParam, "/products"),
  };
}
