import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { getCatalogSpecLabel } from "@/lib/catalog/catalog-i18n";
import { getModelAnchorId } from "@/lib/catalog/model-anchor";
import { findCatalogSeriesBySlug, searchCatalogModels } from "@/lib/catalog/catalog-repository";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ familySlug: string; seriesSlug: string }>;
  searchParams?: Promise<{ model?: string }>;
};

type ProductSeriesPageContentProps = {
  familySlug: string;
  seriesSlug: string;
  locale?: Locale;
  selectedModel?: string;
};

export async function ProductSeriesPageContent({
  familySlug,
  seriesSlug,
  locale = defaultLocale,
  selectedModel,
}: ProductSeriesPageContentProps) {
  const series = await findCatalogSeriesBySlug(familySlug, seriesSlug);

  if (!series) notFound();

  const models = await searchCatalogModels({
    locale,
    seriesSlug,
    selectorOnly: false,
    includeIncomplete: true,
    sortBy: "model",
    sortDirection: "asc",
    page: 1,
    pageSize: 100,
  });

  const familyName = series.family.translations.find((item) => item.locale === locale)?.name ?? series.family.slug;
  const visibleSpecKeys = series.specDefinitions.slice(0, 8);

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: "Products", href: getLocalizedHref(locale, "/products") },
        { label: familyName, href: getLocalizedHref(locale, `/products/${familySlug}`) },
        { label: series.name },
      ]} />

      <div className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{series.code} Series</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">{series.name}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{series.overview}</p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          {series.selectorEligible ? "Selector eligible absorber series" : "Catalog and inquiry series"}
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {series.workingPrinciple ? <InfoCard title="Working principle" body={series.workingPrinciple} /> : null}
        {series.constructionNotes ? <InfoCard title="Construction" body={series.constructionNotes} /> : null}
        {series.applicationNotes ? <InfoCard title="Applications" body={series.applicationNotes} /> : null}
      </div>

      <section className="mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-950">Technical model table</h2>
          <p className="mt-2 text-sm text-slate-600">{models.total} catalog models imported for this series.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Selector status</th>
                {visibleSpecKeys.map((spec) => (
                  <th key={spec.id} className="px-4 py-3 font-medium">{getCatalogSpecLabel(spec, locale)}{spec.unit ? ` (${spec.unit})` : ""}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.items.map((model) => {
                const isSelected = selectedModel === model.model;

                return (
                  <tr
                    key={model.id}
                    id={getModelAnchorId(model.model)}
                    className={isSelected ? "scroll-mt-24 bg-[#e9ede4]" : undefined}
                  >
                    <td className="px-4 py-3 font-medium text-slate-950">{model.model}</td>
                    <td className="px-4 py-3 text-slate-600">{model.selectorStatus}</td>
                    {visibleSpecKeys.map((spec) => {
                      const value = model.specValues.find((item) => item.specDefinition.key === spec.key);
                      return <td key={spec.id} className="px-4 py-3 text-slate-600">{value?.rawValue ?? "—"}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}

export default async function ProductSeriesPage({ params, searchParams }: PageProps) {
  const { familySlug, seriesSlug } = await params;
  const query = searchParams ? await searchParams : {};

  return <ProductSeriesPageContent familySlug={familySlug} seriesSlug={seriesSlug} selectedModel={query.model} />;
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </section>
  );
}
