import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import {
  getProductFamiliesByGroup,
  productCenterLinks,
  productFamilyGroups,
} from "@/lib/content/site";
import {
  localizeFeaturedProductFamily,
  localizeProductCenterLink,
  localizeProductFamilyGroup,
} from "@/lib/i18n/product-copy";
import { getRequestLocale } from "@/lib/i18n/request";
import { getLocalizedHref } from "@/lib/i18n/routing";
import {
  getFeaturedProducts,
  getProductCount,
  getProductTypeSummary,
} from "@/lib/products/product-queries";
import { getProductFamilyCatalogSummaries } from "@/lib/products/product-family-queries";
import { getLocalizedTypeCodeLabel } from "@/lib/products/catalog-master-data";

export const metadata: Metadata = {
  title: "Products",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const locale = await getRequestLocale();
  const isChinese = locale === "zh-cn";
  const copy = {
    eyebrow: {
      en: "Products",
      "zh-cn": "产品中心",
      de: "Produkte",
      fr: "Produits",
      it: "Prodotti",
    },
    title: {
      en: "Browse shock absorbers, buffers and vibration-isolation product lines.",
      "zh-cn": "浏览缓冲器、液压缓冲器与隔振产品系列。",
      de: "Stoßdämpfer, Puffer und Schwingungsisolations-Produktlinien durchsuchen.",
      fr: "Parcourez les gammes d'amortisseurs, de buffers et d'isolateurs vibratoires.",
      it: "Sfoglia le linee di ammortizzatori, buffer e isolatori antivibranti.",
    },
    description: {
      en: "The product center is grouped by buying intent so visitors can move from core machine shock absorbers into buffers, isolation products and specialty damping lines without losing context.",
      "zh-cn": "产品中心按采购意图分组，便于用户从核心缓冲器逐步扩展到液压缓冲、隔振和专项阻尼产品，而不丢失选型上下文。",
      de: "Das Produktzentrum ist nach Kaufabsicht gruppiert, damit Besucher von klassischen Maschinenstoßdämpfern zu Puffern, Isolationsprodukten und Spezialdämpfung wechseln können, ohne den Kontext zu verlieren.",
      fr: "Le centre produits est regroupé par intention d'achat afin de passer des amortisseurs machine aux buffers, produits d'isolation et lignes spéciales sans perdre le contexte.",
      it: "Il centro prodotti è raggruppato per intento di acquisto, così da passare dagli ammortizzatori macchina ai buffer, ai prodotti di isolamento e alle linee speciali senza perdere il contesto.",
    },
    currentCatalog: {
      en: "Current catalog overview",
      "zh-cn": "当前在线目录",
      de: "Aktueller Katalogüberblick",
      fr: "Vue d'ensemble du catalogue",
      it: "Panoramica del catalogo attuale",
    },
    relatedCapabilities: {
      en: "Related capabilities",
      "zh-cn": "相关能力",
      de: "Verwandte Fähigkeiten",
      fr: "Capacités associées",
      it: "Capacità correlate",
    },
    exampleModels: {
      en: "Example models",
      "zh-cn": "示例型号",
      de: "Beispielmodelle",
      fr: "Modèles d'exemple",
      it: "Modelli di esempio",
    },
    view: {
      en: "View",
      "zh-cn": "查看",
      de: "Ansehen",
      fr: "Voir",
      it: "Vedi",
    },
  } as const;
  let catalogCount = 0;
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let typeSummary: Awaited<ReturnType<typeof getProductTypeSummary>> = [];
  let familySummaries: Awaited<ReturnType<typeof getProductFamilyCatalogSummaries>> = [];
  let hasLiveDatabase = true;

  try {
    [catalogCount, featuredProducts, typeSummary, familySummaries] = await Promise.all([
      getProductCount(),
      getFeaturedProducts(8, locale),
      getProductTypeSummary(),
      getProductFamilyCatalogSummaries(4, locale),
    ]);
  } catch (error) {
    hasLiveDatabase = false;
    console.error("Products page fallback activated because the database is unavailable.", error);
  }

  const familySummaryMap = new Map(
    familySummaries.map((family) => [family.familySlug, family]),
  );

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.eyebrow[locale]}
        title={copy.title[locale]}
        description={copy.description[locale]}
      />

      <div className="mt-12 space-y-10">
        {productFamilyGroups.map((group) => {
          const localizedGroup = localizeProductFamilyGroup(locale, group);
          const families = getProductFamiliesByGroup(group.key);

          if (families.length === 0) {
            return null;
          }

          return (
            <section key={group.key} className="rounded-[2rem] border border-line bg-white/75 p-8">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.18em] text-accent-dark">{localizedGroup.name}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold">{localizedGroup.summary}</h2>
                <p className="mt-4 text-sm leading-7 text-steel">{localizedGroup.description}</p>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {families.map((family) => {
                  const localizedFamily = localizeFeaturedProductFamily(locale, family);
                  const familySummary = familySummaryMap.get(family.slug);
                  const familyModelCount = familySummary?.totalModels ?? 0;

                  return (
                    <Link
                      key={family.slug}
                      href={getLocalizedHref(locale, `/products/${family.slug}`)}
                      className="rounded-[1.75rem] border border-line bg-white p-7 transition hover:-translate-y-1 hover:shadow-panel"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.18em] text-accent-dark">
                          {localizedFamily.tag}
                        </span>
                        {localizedFamily.supportingLabel ? (
                          <span className="rounded-full border border-line bg-sand px-3 py-1 text-xs text-steel">
                            {localizedFamily.supportingLabel}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-4 font-display text-3xl font-semibold">{localizedFamily.name}</h3>
                      <p className="mt-4 text-sm leading-7 text-steel">{localizedFamily.summary}</p>

                      <div className="mt-6 flex flex-wrap gap-2 text-xs text-steel">
                        {hasLiveDatabase && familyModelCount > 0 ? (
                          <span className="rounded-full border border-line bg-sand px-3 py-1">
                            {familyModelCount} {locale === "zh-cn" ? "个在线型号" : "catalog models"}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-line bg-sand px-3 py-1">
                          {localizedFamily.specRange.stroke}
                        </span>
                        <span className="rounded-full border border-line bg-sand px-3 py-1">
                          {localizedFamily.specRange.energy}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-[0.14em] text-steel">
                            {locale === "zh-cn" ? "典型应用" : "Typical applications"}
                          </div>
                          <div className="mt-2 text-sm leading-7 text-ink">
                            {localizedFamily.applications.join(" · ")}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.14em] text-steel">
                            {locale === "zh-cn" ? "选型特点" : "Highlights"}
                          </div>
                          <div className="mt-2 text-sm leading-7 text-ink">
                            {localizedFamily.highlights.join(" · ")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-20 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
          <div className="text-xs uppercase tracking-[0.18em] text-accent-dark">
            {copy.currentCatalog[locale]}
          </div>
          {hasLiveDatabase ? (
            <>
              <h2 className="mt-4 font-display text-3xl font-semibold">
                {locale === "zh-cn"
                  ? `${catalogCount} 个型号已经可以在线筛选与查看。`
                  : `${catalogCount} current models can already be filtered and reviewed online.`}
              </h2>
              <p className="mt-4 text-sm leading-7 text-steel">
                {locale === "zh-cn"
                  ? "当前导入数据主要覆盖核心液压缓冲器产品线。更完整的产品家族页仍然有助于理解各系列在 EKD 全部产品中的位置。"
                  : "The imported range currently covers the main hydraulic shock absorber lines. Broader family pages are still useful for understanding where each line fits in the full EKD portfolio."}
              </p>
              <div className="mt-8 space-y-4">
                {typeSummary.map((item) => (
                  <div
                    key={item.typeCode ?? "unknown"}
                    className="flex items-center justify-between rounded-[1.5rem] border border-line bg-white px-5 py-4"
                  >
                    <span className="text-sm font-medium text-ink">
                      {getLocalizedTypeCodeLabel(locale, item.typeCode)}
                    </span>
                    <span className="text-sm text-steel">
                      {item._count._all} {locale === "zh-cn" ? "个型号" : "models"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-4 font-display text-3xl font-semibold">
                {locale === "zh-cn"
                  ? "当在线目录可访问时，这里会显示产品统计。"
                  : "Product totals appear here when the online catalog is available."}
              </h2>
              <p className="mt-6 text-sm leading-7 text-steel">
                {locale === "zh-cn"
                  ? "你现在仍然可以浏览产品分组结构。等目录数据可访问时，这里会显示型号总数与示例型号卡片。"
                  : "You can still browse the grouped product architecture now. Model totals and example model cards will appear here when the catalog feed is reachable."}
              </p>
            </>
          )}
        </div>

        <div className="rounded-[2rem] border border-line bg-white/80 p-8">
          <div className="text-xs uppercase tracking-[0.18em] text-accent-dark">
            {copy.relatedCapabilities[locale]}
          </div>
          <div className="mt-6 space-y-4">
            {productCenterLinks.map((link) => (
              <Link
                key={link.title}
                href={getLocalizedHref(locale, link.href)}
                className="block rounded-[1.5rem] border border-line bg-sand px-5 py-4 hover:border-accent/40"
              >
                {(() => {
                  const localizedLink = localizeProductCenterLink(locale, link);
                  return (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-ink">{localizedLink.title}</div>
                    <div className="mt-2 text-sm text-steel">{localizedLink.description}</div>
                  </div>
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-xs text-steel">
                    {localizedLink.tag}
                  </span>
                </div>
                  );
                })()}
              </Link>
            ))}

            {hasLiveDatabase ? (
              <div className="rounded-[1.5rem] border border-line bg-white px-5 py-4">
                <div className="text-xs uppercase tracking-[0.14em] text-steel">
                  {copy.exampleModels[locale]}
                </div>
                <div className="mt-4 space-y-3">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={getLocalizedHref(locale, `/products/catalog/${product.id}`)}
                      className="flex items-start justify-between gap-4 rounded-[1rem] border border-line bg-sand px-4 py-3 hover:border-accent/40"
                    >
                      <div>
                        <div className="font-medium text-ink">{product.model}</div>
                        <div className="mt-1 text-sm text-steel">
                          {product.localizedTypeLabel} ·{" "}
                          {locale === "zh-cn" ? "行程" : "Stroke"} {product.strokeMm ?? "—"} mm ·{" "}
                          {locale === "zh-cn" ? "单次能量" : "Energy/cycle"} {product.energyPerCycleNm ?? "—"}
                        </div>
                      </div>
                      <span className="text-sm text-accent-dark">{copy.view[locale]}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
