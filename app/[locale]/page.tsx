import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Factory, Gauge, Search, Settings2 } from "lucide-react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { applicationSectors, homeProductFamilies } from "@/lib/content/site";
import {
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { localizeFeaturedProductFamily } from "@/lib/i18n/product-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { localizeScenarioCatalog } from "@/lib/i18n/scenario-copy";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getProductFamilyCatalogSummaries } from "@/lib/products/product-family-queries";
import { getProductCount } from "@/lib/products/product-queries";
import { getScenarioCatalog } from "@/lib/scenarios/registry";
import { cn } from "@/lib/utils/cn";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

function formatRange(min: number | null, max: number | null, unit: string) {
  if (min === null || max === null) {
    return null;
  }

  if (min === max) {
    return `${min} ${unit}`;
  }

  return `${min} to ${max} ${unit}`;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);

  return {
    title: copy.metadata.homeTitle,
    description: copy.metadata.defaultDescription,
  };
}

export default async function LocalizedHomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);
  const scenarioCategories = localizeScenarioCatalog(getScenarioCatalog(), locale).entries;

  let importedProductCount = 0;
  let familySummaryMap = new Map<
    string,
    Awaited<ReturnType<typeof getProductFamilyCatalogSummaries>>[number]
  >();
  let hasLiveCatalog = true;

  try {
    const [catalogCount, familySummaries] = await Promise.all([
      getProductCount(),
      getProductFamilyCatalogSummaries(4, locale),
    ]);

    importedProductCount = catalogCount;
    familySummaryMap = new Map(
      familySummaries.map((summary) => [summary.familySlug, summary]),
    );
  } catch (error) {
    hasLiveCatalog = false;
    console.error("Home page catalog stats fallback activated because the database is unavailable.", error);
  }

  const quickPathIcons = [Search, Factory, Settings2, Gauge];

  return (
    <div className="pb-24">
      <section className="overflow-hidden bg-ink text-white">
        <Container className="grid min-h-[calc(100svh-5rem)] gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/60">
                {copy.home.badge}
              </div>
              <div className="space-y-6">
                <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
                  {copy.home.title}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/70">
                  {copy.home.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={getLocalizedHref(locale, "/products")}
                  className={buttonVariants({ variant: "accent" })}
                >
                  {copy.home.primaryCta}
                </Link>
                <Link
                  href={getLocalizedHref(locale, "/selector/engineer")}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  {copy.home.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {copy.home.audienceCards.map((card) => (
                <div key={`${card.label}-${card.title}`}>
                  <div className="text-sm uppercase tracking-[0.18em] text-white/45">
                    {card.label}
                  </div>
                  <div className="mt-2 text-xl font-medium">{card.title}</div>
                  <div className="mt-1 text-sm text-white/60">{card.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-stretch">
            <div className="absolute inset-0 -translate-y-10 translate-x-10 rounded-[2rem] bg-accent/10 blur-3xl" />
            <div className="relative w-full rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-panel backdrop-blur">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                    {copy.home.routePanel.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    {copy.home.routePanel.title}
                  </h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  {copy.home.routePanel.caption}
                </span>
              </div>

              <div className="space-y-4">
                {copy.home.routePanel.items.map((path, index) => {
                  const Icon = quickPathIcons[index];
                  return (
                    <Link
                      key={path.title}
                      href={getLocalizedHref(locale, path.href)}
                      className="group flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 hover:border-accent/50 hover:bg-white/[0.08]"
                    >
                      <div className="mt-0.5 rounded-2xl border border-white/10 bg-black/20 p-3 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{path.title}</div>
                        <div className="mt-1 text-sm leading-6 text-white/62">
                          {path.description}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-white" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-border">
        <Container className="py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.18em] text-accent-dark">
                {copy.home.motionSection.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                {copy.home.motionSection.title}
              </h2>
            </div>
            <Link
              href={getLocalizedHref(locale, "/selector/engineer")}
              className={cn(buttonVariants({ variant: "secondary" }), "w-fit")}
            >
              {copy.home.motionSection.cta}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {scenarioCategories.map((item) => (
              <Link
                key={item.key}
                href={getLocalizedHref(
                  locale,
                  `/selector/engineer?entryKey=${item.key}`,
                )}
                className="rounded-[1.75rem] border border-line bg-white/70 p-5 transition hover:border-accent/40 hover:bg-white"
              >
                <p className="text-sm font-medium leading-6 text-ink">{item.name}</p>
                <p className="mt-2 text-xs leading-5 text-steel">
                  {item.implementedVariantCount}{" "}
                  {item.implementedVariantCount === 1
                    ? copy.home.motionSection.availableSuffixSingle
                    : copy.home.motionSection.availableSuffixPlural}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-border">
        <Container className="py-20">
          <SectionHeading
            eyebrow={copy.home.productSection.eyebrow}
            title={copy.home.productSection.title}
            description={
              hasLiveCatalog
                ? `${importedProductCount} ${copy.home.productSection.liveDescription}`
                : copy.home.productSection.fallbackDescription
            }
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {homeProductFamilies.map((family) => {
              const localizedFamily = localizeFeaturedProductFamily(locale, family);
              const summary = familySummaryMap.get(family.slug);
              const strokeRange = formatRange(
                summary?.strokeRange.min ?? null,
                summary?.strokeRange.max ?? null,
                "mm stroke",
              );
              const energyRange = formatRange(
                summary?.energyPerCycleRange.min ?? null,
                summary?.energyPerCycleRange.max ?? null,
                "Nm/cycle",
              );

              return (
                <Link
                  key={family.slug}
                  href={getLocalizedHref(locale, `/products/${family.slug}`)}
                  className="group rounded-[2rem] border border-line bg-white/80 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-panel"
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-accent-dark">
                    {localizedFamily.tag}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                    {localizedFamily.name}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-steel">
                    {localizedFamily.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-steel">
                    <span className="rounded-full border border-line bg-sand px-3 py-1">
                      {hasLiveCatalog
                        ? `${summary?.totalModels ?? 0} ${copy.home.productSection.modelsAvailable}`
                        : copy.home.productSection.catalogUnavailable}
                    </span>
                    {hasLiveCatalog && strokeRange ? (
                      <span className="rounded-full border border-line bg-sand px-3 py-1">
                        {strokeRange}
                      </span>
                    ) : null}
                    {hasLiveCatalog && energyRange ? (
                      <span className="rounded-full border border-line bg-sand px-3 py-1">
                        {energyRange}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="section-border">
        <Container className="py-20">
          <SectionHeading
            eyebrow={copy.home.applicationSection.eyebrow}
            title={copy.home.applicationSection.title}
            description={copy.home.applicationSection.description}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {(locale === "zh-cn" ? copy.home.applicationSection.sectors : applicationSectors).map(
              (sector) => (
                <Link
                  key={sector.title}
                  href={getLocalizedHref(locale, sector.href)}
                  className="rounded-[1.75rem] border border-line bg-white/80 p-6 transition hover:-translate-y-1 hover:shadow-panel"
                >
                  <h3 className="font-display text-2xl font-semibold text-ink">{sector.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-steel">{sector.description}</p>
                  <span className="mt-5 inline-flex text-sm font-medium text-accent-dark">
                    {copy.home.applicationSection.explore}
                  </span>
                </Link>
              ),
            )}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-20">
          <SectionHeading
            eyebrow={copy.home.trustSection.eyebrow}
            title={copy.home.trustSection.title}
            description={copy.home.trustSection.description}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {copy.home.trustSection.items.map((item) => (
              <div
                key={item}
                className="rounded-[2rem] border border-line bg-white/80 p-6 text-sm leading-7 text-steel"
              >
                <CheckCircle2 className="mb-4 h-5 w-5 text-accent-dark" />
                {item}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
