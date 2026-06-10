import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { getCatalogTranslation } from "@/lib/catalog/catalog-i18n";
import { findCatalogFamilies } from "@/lib/catalog/catalog-repository";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";

type ProductsPageContentProps = {
  locale?: Locale;
};

export async function ProductsPageContent({ locale = defaultLocale }: ProductsPageContentProps) {
  const families = await findCatalogFamilies(locale);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Product catalog"
        title="Shock absorber and vibration isolation products"
        description="Browse product families, technical series, model specifications, product features and application notes."
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
                {translation?.tag ?? "Product family"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{translation?.name ?? family.slug}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{translation?.summary}</p>
              <p className="mt-5 text-sm font-medium text-slate-900">{family.series.length} technical series</p>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
