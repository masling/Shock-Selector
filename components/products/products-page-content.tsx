import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, Search, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { getCatalogTranslation } from "@/lib/catalog/catalog-i18n";
import { findCatalogFamilies } from "@/lib/catalog/catalog-repository";
import { catalogModelSearchService } from "@/lib/catalog/catalog-service";
import type { CatalogModelSearchResult } from "@/lib/catalog/catalog-schemas";
import { familyVisualModels, productImageUrl } from "@/lib/catalog/product-media";
import {
  directoryKeySpecs, directoryModelHref, directoryPageSize, directoryQuoteHref,
  directorySearchHref, parseDirectorySearch, type DirectorySearchParams,
} from "@/lib/catalog/directory-search";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getCatalogUiCopy } from "@/lib/i18n/catalog-ui-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

type ProductsPageContentProps = { locale?: Locale; searchParams?: DirectorySearchParams };
type CatalogFamily = Awaited<ReturnType<typeof findCatalogFamilies>>[number];

export async function ProductsPageContent({ locale = defaultLocale, searchParams = {} }: ProductsPageContentProps) {
  const ui = getCatalogUiCopy(locale);
  const search = parseDirectorySearch(searchParams);
  const productsHref = getLocalizedHref(locale, "/products");
  const quoteHref = directoryQuoteHref(locale);
  let families: CatalogFamily[] = [];
  let result: CatalogModelSearchResult | null = null;
  let unavailable = false;

  try {
    [families, result] = await Promise.all([
      findCatalogFamilies(locale),
      search.query && search.valid
        ? catalogModelSearchService({ locale, modelQuery: search.modelQuery, page: search.page, pageSize: directoryPageSize })
        : Promise.resolve(null),
    ]);
  } catch {
    unavailable = true;
    console.error("Product directory could not be loaded.");
  }

  const primary = families.slice(0, 3);
  const additional = families.slice(3);
  const needsTranslationNote = locale !== "en" && locale !== "zh-cn";
  const hasPreviewImages = families.some((family) => {
    const model = familyVisualModels[family.slug];
    return model && productImageUrl(model);
  });

  return (
    <Container className="py-6 md:py-12">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end lg:gap-12">
        <div className="max-w-3xl">
          <h1 className="font-sans text-3xl font-semibold leading-tight tracking-tight text-ink [overflow-wrap:anywhere] md:text-[2.75rem]">
            {ui.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-steel">{ui.intro}</p>
        </div>
        <Link className={cn(buttonVariants({ variant: "accent" }), "self-start whitespace-nowrap lg:mb-1")} href={quoteHref}>
          {ui.quote}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-6 border-y border-line py-4 md:mt-8 md:py-5">
        <form action={productsHref} method="get" role="search" className="max-w-3xl">
          <label htmlFor="catalog-model-search" className="field-label">{ui.searchLabel}</label>
          <div className="flex gap-2">
            <input
              key={search.query}
              id="catalog-model-search"
              name="q"
              type="search"
              defaultValue={search.query}
              maxLength={80}
              placeholder={ui.placeholder}
              autoComplete="off"
              className="field min-w-0 flex-1 text-base"
              aria-invalid={!search.valid || undefined}
              aria-describedby={!search.valid ? "catalog-search-error" : undefined}
            />
            <button type="submit" className={buttonVariants({ variant: "accent" })}>
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{ui.search}</span>
            </button>
          </div>
          {!search.valid && <p id="catalog-search-error" role="alert" className="mt-2 text-sm text-red-800">{ui.tooLong}</p>}
        </form>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 md:mt-3">
          <Link href={getLocalizedHref(locale, "/selector/buyer")} className="text-link min-h-11">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />{ui.filter}
          </Link>
          <Link href={getLocalizedHref(locale, "/selector/engineer")} className="text-link min-h-11">
            {ui.sizing}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {search.query && <Link href={productsHref} className="text-link min-h-11 underline underline-offset-4">{ui.clear}</Link>}
        </div>
      </div>

      {needsTranslationNote && <p className="mt-4 max-w-3xl text-sm leading-6 text-steel">{ui.technicalNote}</p>}
      {unavailable && (
        <div role="alert" className="mt-8 rounded-lg border border-line bg-white p-6">
          <p>{ui.unavailable}</p>
          <a href={search.query ? directorySearchHref(locale, search.query, search.page) : productsHref} className="text-link mt-3 min-h-11">{ui.retry}</a>
        </div>
      )}

      {result && (
        <section id="catalog-results" className="scroll-mt-24 pt-8" aria-labelledby="catalog-results-title">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
            <h2 id="catalog-results-title" className="text-2xl font-semibold">{ui.results}: “{search.query}”</h2>
            {result.items.length > 0 && <p className="text-sm tabular-nums text-steel">
              {(result.page - 1) * result.pageSize + 1}–{Math.min(result.page * result.pageSize, result.total)} / {result.total}
            </p>}
          </div>
          {result.items.length === 0 ? (
            <div className="py-8">
              <p className="text-lg font-semibold">{result.total ? ui.pageMissing : ui.noResults}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">{ui.noResultsHelp}</p>
              {result.total > 0 && <Link className="text-link mt-3 min-h-11" href={directorySearchHref(locale, search.query)}>{ui.firstPage}</Link>}
              <Link className="text-link mt-3 min-h-11" href={quoteHref}>{ui.quote}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          ) : (
            <div>
              {result.items.map((model) => (
                <article key={model.id} className="grid gap-4 border-b border-line py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] lg:items-center lg:gap-6">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold">
                      <Link className="underline decoration-line underline-offset-4 hover:text-accent" href={directoryModelHref(locale, model)}>{model.model}</Link>
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-steel">{model.seriesCode} · {model.familyName}</p>
                  </div>
                  <dl className="grid grid-cols-3 gap-3" lang={locale === "zh-cn" ? "zh-CN" : "en"}>
                    {directoryKeySpecs(model).map((spec) => (
                      <div key={spec.key} className="min-w-0">
                        <dt className="text-xs leading-5 text-steel">{spec.label}{spec.unit ? ` (${spec.unit})` : ""}</dt>
                        <dd className="mt-1 break-words text-base font-semibold tabular-nums">{spec.rawValue?.trim() || String(spec.value ?? "—")}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:items-end">
                    <Link className="text-link min-h-11" href={directoryModelHref(locale, model)}>{ui.specifications}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    <Link className="text-link min-h-11 underline underline-offset-4" href={directoryQuoteHref(locale, model.model)}>{ui.quote}</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          {result.total > result.pageSize && (
            <nav className="mt-5 flex flex-wrap items-center justify-between gap-4" aria-label={ui.pagination}>
              {result.page > 1 ? <Link className={buttonVariants({ variant: "secondary" })} href={directorySearchHref(locale, search.query, result.page - 1)}>{ui.previous}</Link> : <span />}
              <span className="text-sm tabular-nums text-steel">{result.page} / {Math.ceil(result.total / result.pageSize)}</span>
              {result.page * result.pageSize < result.total ? <Link className={buttonVariants({ variant: "secondary" })} href={directorySearchHref(locale, search.query, result.page + 1)}>{ui.next}</Link> : <span />}
            </nav>
          )}
        </section>
      )}

      {families.length > 0 && <section aria-labelledby="product-families-title" className="pt-6 md:pt-10">
        <h2 id="product-families-title" className="mb-5 text-2xl font-semibold">{ui.families}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {primary.map((family) => <FamilyCard key={family.id} family={family} locale={locale} />)}
        </div>
        {additional.length > 0 && <div className="mt-5 grid gap-5 md:grid-cols-2">
          {additional.map((family) => <FamilyCard key={family.id} family={family} locale={locale} compact />)}
        </div>}
        {process.env.NODE_ENV !== "production" && hasPreviewImages && <p className="mt-4 text-xs leading-5 text-steel">{ui.preview}</p>}
      </section>}

      <section className="mt-10 flex flex-col justify-between gap-5 rounded-xl bg-mist p-6 md:flex-row md:items-center md:p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">{ui.help}</h2>
          <p className="mt-2 text-sm leading-7 text-steel">{ui.helpText}</p>
        </div>
        <a className={cn(buttonVariants({ variant: "secondary" }), "self-start md:shrink-0")} href={`mailto:${brand.email}`}>
          <Mail className="h-4 w-4" aria-hidden="true" />{ui.email}
        </a>
      </section>
    </Container>
  );
}

function FamilyCard({ family, locale, compact = false }: { family: CatalogFamily; locale: Locale; compact?: boolean }) {
  const translation = getCatalogTranslation(family.translations, locale);
  const ui = getCatalogUiCopy(locale);
  const model = familyVisualModels[family.slug];
  const src = model ? productImageUrl(model) : null;
  const href = getLocalizedHref(locale, `/products/${family.slug}`);

  return (
    <Link href={href} className={cn(
      "group flex overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-accent",
      compact ? "flex-row items-center" : "flex-col",
    )}>
      {src && <div className={cn("shrink-0 bg-mist", compact ? "flex h-full w-24 items-center p-3 sm:w-36 sm:p-4" : "flex h-40 items-center justify-center p-5 md:h-52 md:p-7")}>
        {/* Preview-only source assets deliberately bypass the public image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={500} height={400} alt={`${ui.representative}: ${model}`} loading="lazy" className="product-image h-full w-full" />
      </div>}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div lang={translation?.locale === "zh-cn" ? "zh-CN" : translation?.locale}>
          <h3 className="text-xl font-semibold leading-7 text-ink group-hover:text-accent">{translation?.name ?? family.slug}</h3>
          <p className="mt-3 text-sm leading-6 text-steel">{translation?.summary ?? ui.pipeNote}</p>
        </div>
        <p className="mt-4 text-xs leading-5 text-steel">{ui.series}: <span className="font-medium text-ink">{family.series.map((series) => series.code).join(" · ")}</span></p>
        <span className="mt-auto flex min-h-11 items-center justify-between gap-3 pt-4 text-sm font-semibold text-accent">
          {ui.viewSeries}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
