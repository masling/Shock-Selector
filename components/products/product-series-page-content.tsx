import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { getCatalogSpecLabel } from "@/lib/catalog/catalog-i18n";
import { getModelAnchorId } from "@/lib/catalog/model-anchor";
import { findCatalogSeriesBySlug, searchCatalogModels } from "@/lib/catalog/catalog-repository";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getProductCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { PipeCatalogMedia } from "@/components/products/pipe-catalog-media";
import Link from "next/link";
import { getCatalogUiCopy } from "@/lib/i18n/catalog-ui-copy";
import { directoryQuoteHref } from "@/lib/catalog/directory-search";

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
  const ui = getCatalogUiCopy(locale);

  return (
    <Container className="py-10 md:py-12">
      <Breadcrumb items={[
        { label: copy.productsBreadcrumb, href: getLocalizedHref(locale, "/products") },
        { label: familyName, href: getLocalizedHref(locale, `/products/${familySlug}`) },
        { label: series.name },
      ]} />

      <div className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {series.code} {copy.seriesSuffix}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{series.name}</h1>
        <p className="mt-5 text-lg leading-8 text-steel">{series.overview}</p>
        <p className="mt-4 text-sm font-medium text-steel">
          {series.selectorEligible ? copy.selectorEligibleSeries : copy.catalogInquirySeries}
        </p>
      </div>

      {familySlug === "flexible-pipe-connections" && <PipeCatalogMedia locale={locale} seriesCodes={[series.code]} />}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {series.workingPrinciple ? <InfoCard title={copy.workingPrinciple} body={series.workingPrinciple} /> : null}
        {series.constructionNotes ? <InfoCard title={copy.construction} body={series.constructionNotes} /> : null}
        {series.applicationNotes ? <InfoCard title={copy.applications} body={series.applicationNotes} /> : null}
      </div>

      <section className="mt-14 overflow-hidden rounded-xl border border-line bg-white">
        <div className="border-b border-line p-6">
          <h2 className="text-2xl font-semibold text-ink">{copy.technicalModelTable}</h2>
          <p className="mt-2 text-sm text-steel">{models.total} {copy.catalogModelsImported}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-sand text-steel">
              <tr>
                <th className="px-4 py-3 font-medium">{copy.model}</th>
                {visibleSpecKeys.map((spec) => (
                  <th key={spec.id} className="px-4 py-3 font-medium">{getCatalogSpecLabel(spec, locale)}{spec.unit ? ` (${spec.unit})` : ""}</th>
                ))}
                <th className="px-4 py-3 font-medium">{ui.quote}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.items.map((model) => {
                const isSelected = selectedModel === model.model;

                return (
                  <tr
                    key={model.id}
                    id={getModelAnchorId(model.model)}
                    className={isSelected ? "scroll-mt-24 bg-mist" : undefined}
                  >
                    <td className="px-4 py-3 font-medium text-ink">{model.model}</td>
                    {visibleSpecKeys.map((spec) => {
                      const value = model.specValues.find((item) => item.specDefinition.key === spec.key);
                      return <td key={spec.id} className="px-4 py-3 text-steel">{value?.rawValue ?? "—"}</td>;
                    })}
                    <td className="px-4 py-3"><Link className="text-link min-h-11 whitespace-nowrap" href={directoryQuoteHref(locale, model.model)}>{ui.quote}</Link></td>
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
    <section className="rounded-xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-steel">{body}</p>
    </section>
  );
}
