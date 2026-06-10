import { notFound } from "next/navigation";
import { EngineerSizingPageContent } from "@/app/selector/engineer/page";
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
