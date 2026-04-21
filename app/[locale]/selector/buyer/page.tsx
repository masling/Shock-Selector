import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyerSearchClient } from "@/components/marketing/buyer-search-client";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedTypeCodeLabel } from "@/lib/products/catalog-master-data";
import { getProductThreadSizes, getProductTypes } from "@/lib/products/product-queries";

type BuyerQuickFilterPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BuyerQuickFilterPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return { title: copy.metadata.buyerTitle };
}

export default async function BuyerQuickFilterPage({
  params,
}: BuyerQuickFilterPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);
  const [productTypes, threadSizes] = await Promise.all([
    getProductTypes(),
    getProductThreadSizes(),
  ]);
  const productTypeOptions = productTypes.map((typeCode) => ({
    value: typeCode,
    label: getLocalizedTypeCodeLabel(locale, typeCode),
  }));

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: copy.buyer.eyebrow },
      ]} />
      <SectionHeading
        eyebrow={copy.buyer.eyebrow}
        title={copy.buyer.title}
        description={copy.buyer.description}
      />

      <div className="mt-12">
        <BuyerSearchClient
          locale={locale}
          copy={copy.buyer}
          productTypeOptions={productTypeOptions}
          threadSizeOptions={threadSizes}
        />
      </div>
    </Container>
  );
}
