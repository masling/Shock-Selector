import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { getCatalogSpecLabel } from "@/lib/catalog/catalog-i18n";
import { getModelAnchorId } from "@/lib/catalog/model-anchor";
import { findCatalogSeriesBySlug, searchCatalogModels } from "@/lib/catalog/catalog-repository";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getProductCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";

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
  const copy = getProductCenterCopy(locale);

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: copy.productsBreadcrumb, href: getLocalizedHref(locale, "/products") },
        { label: familyName, href: getLocalizedHref(locale, `/products/${familySlug}`) },
        { label: series.name },
      ]} />

      <div className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {series.code} {copy.seriesSuffix}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">{series.name}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{series.overview}</p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          {series.selectorEligible ? copy.selectorEligibleSeries : copy.catalogInquirySeries}
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {series.workingPrinciple ? <InfoCard title={copy.workingPrinciple} body={series.workingPrinciple} /> : null}
        {series.constructionNotes ? <InfoCard title={copy.construction} body={series.constructionNotes} /> : null}
        {series.applicationNotes ? <InfoCard title={copy.applications} body={series.applicationNotes} /> : null}
      </div>

      <section className="mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-950">{copy.technicalModelTable}</h2>
          <p className="mt-2 text-sm text-slate-600">{models.total} {copy.catalogModelsImported}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">{copy.model}</th>
                <th className="px-4 py-3 font-medium">{copy.selectorStatus}</th>
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

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </section>
  );
}
