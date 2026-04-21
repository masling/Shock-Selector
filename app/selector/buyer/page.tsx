import type { Metadata } from "next";
import { BuyerSearchClient } from "@/components/marketing/buyer-search-client";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedTypeCodeLabel } from "@/lib/products/catalog-master-data";
import { getProductThreadSizes, getProductTypes } from "@/lib/products/product-queries";

export const metadata: Metadata = {
  title: "Buyer Quick Filter",
};

export const dynamic = "force-dynamic";

export default async function BuyerQuickFilterPage() {
  const copy = getSiteCopy("en");
  const [productTypes, threadSizes] = await Promise.all([
    getProductTypes(),
    getProductThreadSizes(),
  ]);
  const productTypeOptions = productTypes.map((typeCode) => ({
    value: typeCode,
    label: getLocalizedTypeCodeLabel("en", typeCode),
  }));

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.buyer.eyebrow}
        title={copy.buyer.title}
        description={copy.buyer.description}
      />

      <div className="mt-12">
        <BuyerSearchClient
          locale="en"
          copy={copy.buyer}
          productTypeOptions={productTypeOptions}
          threadSizeOptions={threadSizes}
        />
      </div>
    </Container>
  );
}
