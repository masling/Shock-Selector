import { notFound } from "next/navigation";
import { BuyerQuickFilterPageContent } from "@/components/selector/buyer-page-content";
import { isLocale } from "@/lib/i18n/config";

type LocaleBuyerPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function LocaleBuyerQuickFilterPage({ params }: LocaleBuyerPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <BuyerQuickFilterPageContent locale={locale} />;
}
