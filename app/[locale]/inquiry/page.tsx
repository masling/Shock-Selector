import { notFound } from "next/navigation";
import { InquiryPageClient } from "@/components/inquiry/inquiry-page-client";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";

type InquiryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InquiryPage({ params }: InquiryPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  return (
    <Container className="py-16">
      <InquiryPageClient locale={localeParam as Locale} />
    </Container>
  );
}
