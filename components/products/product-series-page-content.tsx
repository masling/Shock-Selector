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
import { listModelDownloadsForModels, type ModelDownload } from "@/lib/downloads/download-service";
import { ModelDownloadButton } from "@/components/products/model-download-button";
import Image from "next/image";
import { editorialUi, getSeriesEditorial } from "@/lib/catalog/series-editorial";
import { SeriesCatalogFigure } from "@/components/products/series-catalog-figure";

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
  const editorial = getSeriesEditorial(series.code, locale);
  const detailUi = editorialUi(locale);
  const name = editorial?.name ?? series.name;

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
  let downloadsByModel = new Map<string, ModelDownload[]>();
  try { downloadsByModel = await listModelDownloadsForModels(models.items.map((model) => model.id)); }
  catch { /* Product specifications remain available if private downloads are temporarily unavailable. */ }

  return (
    <Container className="py-10 md:py-12">
      <Breadcrumb items={[
        { label: copy.productsBreadcrumb, href: getLocalizedHref(locale, "/products") },
        { label: familyName, href: getLocalizedHref(locale, `/products/${familySlug}`) },
        { label: name },
      ]} />

      <div className="mt-8 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_300px]" lang={editorial?.language}>
        <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {series.code} {copy.seriesSuffix}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink md:text-4xl">{name}</h1>
        <p className="mt-5 text-lg leading-8 text-steel">{editorial?.overview ?? series.overview}</p>
        <p className="mt-4 text-sm font-medium text-steel">
          {series.selectorEligible ? copy.selectorEligibleSeries : copy.catalogInquirySeries}
        </p>
        <Link href={directoryQuoteHref(locale, series.code)} className="text-link mt-4 min-h-11">{detailUi.quote} →</Link>
        </div>
        {editorial?.photo && familySlug !== "flexible-pipe-connections" && <figure>
          <Image src={editorial.photo.url} alt={name} width={editorial.photo.width} height={editorial.photo.height} sizes="300px" priority className="h-52 w-full object-contain" />
          <figcaption className="mt-3 text-center text-xs leading-5 text-steel">{detailUi.illustration}</figcaption>
        </figure>}
      </div>

      {familySlug === "flexible-pipe-connections" && <PipeCatalogMedia locale={locale} seriesCodes={[series.code]} />}

      {editorial ? <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-2" lang={editorial.language}>
        <section><h2 className="text-xl font-semibold">{detailUi.principle}</h2><p className="mt-3 text-sm leading-7 text-steel">{editorial.principle}</p></section>
        <section><h2 className="text-xl font-semibold">{detailUi.applications}</h2><p className="mt-3 text-sm leading-7 text-steel">{editorial.applications}</p></section>
      </div> : <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {series.workingPrinciple ? <InfoCard title={copy.workingPrinciple} body={series.workingPrinciple} /> : null}
        {series.constructionNotes ? <InfoCard title={copy.construction} body={series.constructionNotes} /> : null}
        {series.applicationNotes ? <InfoCard title={copy.applications} body={series.applicationNotes} /> : null}
      </div>}
      <SeriesCatalogFigure code={series.code} locale={locale} />

      {models.total > 0 ? <section className="mt-14 overflow-hidden rounded-xl border border-line bg-white">
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
                {downloadsByModel.size > 0 ? <th className="px-4 py-3 font-medium">{ui.documents}</th> : null}
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
                    {downloadsByModel.size > 0 ? <td className="px-4 py-3">
                      <div className="flex min-w-32 flex-wrap gap-2">
                        {(downloadsByModel.get(model.id) ?? []).map((download) => <ModelDownloadButton key={download.id} id={download.id} format={download.format} locale={locale} preparing={ui.preparingDownload} failure={ui.downloadError} />)}
                        {!downloadsByModel.has(model.id) ? <span className="text-steel">—</span> : null}
                      </div>
                    </td> : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section> : <section className="mt-12 rounded-lg bg-mist p-6" lang={editorial?.language}>
        <h2 className="text-xl font-semibold">{detailUi.selection}</h2>
        <p className="mt-3 max-w-prose text-sm leading-7 text-steel">{detailUi.noModels}</p>
        <Link href={directoryQuoteHref(locale, series.code)} className="text-link mt-4 min-h-11">{detailUi.quote} →</Link>
      </section>}
      {editorial && <p className="mt-6 text-xs leading-6 text-steel" lang={editorial.language}>{detailUi.basis}: {detailUi.catalog} · {detailUi.page} {editorial.source.pages.join(", ")}</p>}
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
