import { notFound } from "next/navigation";
import Link from "next/link";
import { InquiryPageClient } from "@/components/inquiry/inquiry-page-client";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isInquiryPortalEnabled } from "@/lib/inquiry/inquiry-service";
import { getInquiryPortalCopy } from "@/lib/i18n/inquiry-portal-copy";

type InquiryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InquiryPage({ params }: InquiryPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  return (
    <Container className="py-10 md:py-12">
      {isInquiryPortalEnabled() && <div className="mb-6 flex flex-wrap gap-5 border-b border-line pb-5">
        <Link className="text-link min-h-11" href={`/${localeParam}/account/inquiries/new`}>{getInquiryPortalCopy(localeParam).newInquiry}</Link>
        <Link className="text-link min-h-11" href={`/${localeParam}/account/inquiries`}>{getInquiryPortalCopy(localeParam).title}</Link>
      </div>}
      <InquiryPageClient locale={localeParam as Locale} />
    </Container>
  );
}
