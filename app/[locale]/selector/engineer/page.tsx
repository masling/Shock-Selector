import { notFound } from "next/navigation";
import { EngineerSizingPageContent } from "@/components/selector/engineer-page-content";
import { isLocale } from "@/lib/i18n/config";

type LocaleEngineerPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleEngineerSizingPage({ params }: LocaleEngineerPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <EngineerSizingPageContent locale={locale} />;
}
