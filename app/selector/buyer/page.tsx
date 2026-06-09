import type { Metadata } from "next";
import { BuyerSearchClient } from "@/components/marketing/buyer-search-client";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { listCatalogThreadSizes } from "@/lib/catalog/catalog-repository";
import { getSiteCopy } from "@/lib/i18n/site-copy";

export const metadata: Metadata = {
  title: "Buyer Quick Filter for Shock Absorber and Vibration Isolation Models",
};

export const dynamic = "force-dynamic";

export default async function BuyerQuickFilterPage() {
  const copy = getSiteCopy("en");
  const threadSizes = await listCatalogThreadSizes();

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.buyer.eyebrow}
        title={copy.buyer.title}
        description="Search the rebuilt PDF-backed catalog by model, series and key technical values."
      />

      <div className="mt-12">
        <BuyerSearchClient locale="en" copy={copy.buyer} threadSizeOptions={threadSizes} />
      </div>
    </Container>
  );
}
