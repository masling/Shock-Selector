import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { getCatalogTranslation } from "@/lib/catalog/catalog-i18n";
import { findCatalogFamilyBySlug } from "@/lib/catalog/catalog-repository";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ familySlug: string }>;
};

type ProductFamilyPageContentProps = {
  familySlug: string;
  locale?: Locale;
};

export async function ProductFamilyPageContent({
  familySlug,
  locale = defaultLocale,
}: ProductFamilyPageContentProps) {
  const family = await findCatalogFamilyBySlug(familySlug, locale);

  if (!family) notFound();

  const translation = getCatalogTranslation(family.translations, locale);

  return (
    <Container className="py-16">
      <Breadcrumb items={[{ label: "Products", href: getLocalizedHref(locale, "/products") }, { label: translation?.name ?? family.slug }]} />

      <div className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{translation?.tag}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">{translation?.name}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{translation?.description}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {translation?.workingPrinciple ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">Working principle</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{translation.workingPrinciple}</p>
          </section>
        ) : null}
        {translation?.constructionNotes ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">Construction</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{translation.constructionNotes}</p>
          </section>
        ) : null}
        {translation?.applicationNotes ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">Applications</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{translation.applicationNotes}</p>
          </section>
        ) : null}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-slate-950">Series in this family</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {family.series.map((series) => (
            <Link
              key={series.id}
              href={getLocalizedHref(locale, `/products/${family.slug}/${series.slug}`)}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-slate-950">{series.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{series.code}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{series.overview}</p>
              <p className="mt-4 text-sm font-medium text-emerald-700">
                {series.selectorEligible ? "Available for absorber selector" : "Catalog / inquiry product"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}

export default async function ProductFamilyPage({ params }: PageProps) {
  const { familySlug } = await params;
  return <ProductFamilyPageContent familySlug={familySlug} />;
}
