import { notFound } from "next/navigation";
import { ProductFamilyPageContent } from "@/app/products/[familySlug]/page";
import { isLocale } from "@/lib/i18n/config";

type LocaleProductFamilyPageProps = {
  params: Promise<{ locale: string; familySlug: string }>;
};

export const dynamic = "force-dynamic";

export default async function LocaleProductFamilyPage({ params }: LocaleProductFamilyPageProps) {
  const { locale, familySlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ProductFamilyPageContent familySlug={familySlug} locale={locale} />;
}
