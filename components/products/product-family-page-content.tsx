import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { getCatalogTranslation } from "@/lib/catalog/catalog-i18n";
import { findCatalogFamilyBySlug } from "@/lib/catalog/catalog-repository";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getProductCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { PipeCatalogMedia } from "@/components/products/pipe-catalog-media";
import { familyVisualModels, productImageUrl } from "@/lib/catalog/product-media";
import { getCatalogUiCopy } from "@/lib/i18n/catalog-ui-copy";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { getSeriesEditorial } from "@/lib/catalog/series-editorial";

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
  const copy = getProductCenterCopy(locale);
  const ui = getCatalogUiCopy(locale);
  const visualModel = familyVisualModels[family.slug];
  const photo = visualModel ? productImageUrl(visualModel) : null;

  return (
    <Container className="py-10 md:py-12">
      <Breadcrumb items={[{ label: copy.productsBreadcrumb, href: getLocalizedHref(locale, "/products") }, { label: translation?.name ?? family.slug }]} />

      <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="max-w-3xl" lang={translation?.locale === "zh-cn" ? "zh-CN" : translation?.locale}>
          <p className="text-sm font-medium text-accent">{translation?.tag}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-[2.65rem] md:leading-[1.2]">{translation?.name}</h1>
          <p className="mt-4 text-base leading-7 text-steel">{translation?.description}</p>
          <Link href={getLocalizedHref(locale, "/contact")} className={buttonVariants({variant:"accent", className:"mt-5"})}>{ui.quote}</Link>
        </div>
        {photo && family.slug !== "flexible-pipe-connections" && <figure className="shrink-0 sm:w-[250px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt={`${ui.representative}: ${translation?.name}`} width={250} height={180} className="product-image h-40 w-full" />
          <figcaption className="mt-2 text-center text-xs text-steel">{ui.representative}</figcaption>
        </figure>}
      </div>

      {family.slug === "flexible-pipe-connections" && <PipeCatalogMedia locale={locale} seriesCodes={family.series.map((series) => series.code)} />}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {translation?.workingPrinciple ? (
          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">{copy.workingPrinciple}</h2>
            <p className="mt-3 text-sm leading-6 text-steel">{translation.workingPrinciple}</p>
          </section>
        ) : null}
        {translation?.constructionNotes ? (
          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">{copy.construction}</h2>
            <p className="mt-3 text-sm leading-6 text-steel">{translation.constructionNotes}</p>
          </section>
        ) : null}
        {translation?.applicationNotes ? (
          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">{copy.applications}</h2>
            <p className="mt-3 text-sm leading-6 text-steel">{translation.applicationNotes}</p>
          </section>
        ) : null}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-ink">{copy.seriesInFamily}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {family.series.map((series) => {
            const editorial = getSeriesEditorial(series.code, locale);
            return (
            <Link
              key={series.id}
              href={getLocalizedHref(locale, `/products/${family.slug}/${series.slug}`)}
              className="rounded-xl border border-line bg-white p-6 transition hover:border-accent"
            >
              {editorial?.photo && <Image src={editorial.photo.url} alt={editorial.name} width={editorial.photo.width} height={editorial.photo.height} sizes="(min-width: 768px) 40vw, 90vw" className="mb-5 h-36 w-full object-contain" />}
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-ink" lang={editorial?.language}>{editorial?.name ?? series.name}</h3>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-steel">{series.code}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-steel" lang={editorial?.language}>{editorial?.overview ?? series.overview}</p>
              <p className="mt-4 text-sm font-medium text-accent">
                {series.selectorEligible ? copy.availableForSelector : copy.catalogInquiryProduct}
              </p>
            </Link>
          );})}
        </div>
      </section>
    </Container>
  );
}
