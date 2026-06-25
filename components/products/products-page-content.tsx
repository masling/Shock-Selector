import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { getCatalogTranslation } from "@/lib/catalog/catalog-i18n";
import { findCatalogFamilies } from "@/lib/catalog/catalog-repository";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getProductCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";

type ProductsPageContentProps = {
  locale?: Locale;
};

export async function ProductsPageContent({ locale = defaultLocale }: ProductsPageContentProps) {
  const families = await findCatalogFamilies(locale);
  const copy = getProductCenterCopy(locale);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {families.map((family) => {
          const translation = getCatalogTranslation(family.translations, locale);
          return (
            <Link
              key={family.id}
              href={getLocalizedHref(locale, `/products/${family.slug}`)}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                {translation?.tag ?? copy.familyFallbackTag}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{translation?.name ?? family.slug}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {translation?.summary ?? copy.familyFallbackSummary}
              </p>
              <p className="mt-5 text-sm font-medium text-slate-900">
                {family.series.length} {copy.technicalSeriesLabel}
              </p>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
