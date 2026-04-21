import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { getProductFamilyCatalogBySlug } from "@/lib/products/product-family-queries";
import {
  getFamilyBySlug,
  getFamilyModels,
  getProductFamilyGroup,
  productFamilies,
} from "@/lib/content/site";
import {
  getLocalizedProductFamilyName,
  localizeFeaturedProductFamily,
  localizeFeaturedModel,
  localizeProductFamilyGroup,
} from "@/lib/i18n/product-copy";
import { getRequestLocale } from "@/lib/i18n/request";
import { getLocalizedHref } from "@/lib/i18n/routing";

type FamilyPageProps = {
  params: Promise<{ familySlug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: FamilyPageProps): Promise<Metadata> {
  const { familySlug } = await params;
  const family = getFamilyBySlug(familySlug);

  return {
    title: family ? family.name : "Product family",
  };
}

function formatMetricRange(min: number | null, max: number | null, unit: string) {
  if (min === null || max === null) {
    return "—";
  }

  if (min === max) {
    return `${min} ${unit}`;
  }

  return `${min} to ${max} ${unit}`;
}

export default async function ProductFamilyPage({ params }: FamilyPageProps) {
  const locale = await getRequestLocale();
  const isChinese = locale === "zh-cn";
  const copy = {
    products: {
      en: "Products",
      "zh-cn": "产品中心",
      de: "Produkte",
      fr: "Produits",
      it: "Prodotti",
    },
    productFamily: {
      en: "Product family",
      "zh-cn": "产品家族",
      de: "Produktfamilie",
      fr: "Famille de produits",
      it: "Famiglia di prodotto",
    },
    modelsInCatalog: {
      en: "Models in catalog",
      "zh-cn": "在线目录型号",
      de: "Modelle im Katalog",
      fr: "Modèles dans le catalogue",
      it: "Modelli nel catalogo",
    },
    strokeRange: {
      en: "Stroke range",
      "zh-cn": "行程范围",
      de: "Hubbereich",
      fr: "Plage de course",
      it: "Intervallo di corsa",
    },
    energyPerCycle: {
      en: "Energy / cycle",
      "zh-cn": "单次能量",
      de: "Energie / Zyklus",
      fr: "Énergie / cycle",
      it: "Energia / ciclo",
    },
    applications: {
      en: "Typical applications",
      "zh-cn": "典型应用",
      de: "Typische Anwendungen",
      fr: "Applications typiques",
      it: "Applicazioni tipiche",
    },
    fitFor: {
      en: "Best fit for",
      "zh-cn": "更适合",
      de: "Besonders geeignet für",
      fr: "Particulièrement adapté à",
      it: "Più adatto a",
    },
    caution: {
      en: "Use caution for",
      "zh-cn": "需谨慎评估",
      de: "Mit Vorsicht prüfen bei",
      fr: "À évaluer avec prudence pour",
      it: "Da valutare con cautela per",
    },
    highlights: {
      en: "What this family emphasizes",
      "zh-cn": "该系列强调点",
      de: "Worauf diese Familie ausgelegt ist",
      fr: "Ce que cette famille met en avant",
      it: "Cosa enfatizza questa famiglia",
    },
    exampleModels: {
      en: "Example models",
      "zh-cn": "示例型号",
      de: "Beispielmodelle",
      fr: "Modèles d'exemple",
      it: "Modelli di esempio",
    },
    relatedResources: {
      en: "Related resources",
      "zh-cn": "相关资料",
      de: "Zugehörige Unterlagen",
      fr: "Ressources associées",
      it: "Risorse correlate",
    },
    catalogResource: {
      en: "Catalog resource",
      "zh-cn": "产品资料",
      de: "Katalogunterlage",
      fr: "Ressource catalogue",
      it: "Risorsa catalogo",
    },
    secondRoute: {
      en: "Need a second route?",
      "zh-cn": "需要换个入口？",
      de: "Brauchen Sie einen zweiten Einstieg?",
      fr: "Besoin d'une autre entrée ?",
      it: "Serve un altro punto di ingresso?",
    },
    guidedSizing: {
      en: "Open guided sizing",
      "zh-cn": "打开引导选型",
      de: "Geführte Auslegung öffnen",
      fr: "Ouvrir le dimensionnement guidé",
      it: "Apri il dimensionamento guidato",
    },
  } as const;
  const { familySlug } = await params;
  const family = getFamilyBySlug(familySlug);

  if (!family) {
    notFound();
  }

  const fallbackModels = getFamilyModels(family.slug);
  const group = getProductFamilyGroup(family.groupKey);
  const localizedGroup = group ? localizeProductFamilyGroup(locale, group) : null;
  const localizedFamily = localizeFeaturedProductFamily(locale, family);
  let liveCatalog = null as Awaited<ReturnType<typeof getProductFamilyCatalogBySlug>> | null;
  let hasLiveCatalog = true;

  try {
    liveCatalog = await getProductFamilyCatalogBySlug(family.slug, 8, locale);
  } catch (error) {
    hasLiveCatalog = false;
    console.error(`Product family page fallback activated for ${family.slug}.`, error);
  }

  const liveModels = liveCatalog?.representativeProducts ?? [];
  const showLiveModels = hasLiveCatalog && liveModels.length > 0;

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: copy.products[locale], href: "/products" },
        { label: liveCatalog?.localizedName ?? getLocalizedProductFamilyName(locale, family.slug, family.name) },
      ]} />
      <SectionHeading
        eyebrow={localizedGroup?.name ?? copy.productFamily[locale]}
        title={liveCatalog?.localizedName ?? getLocalizedProductFamilyName(locale, family.slug, family.name)}
        description={localizedFamily.summary}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <span className="rounded-full border border-line bg-sand px-4 py-2 text-xs uppercase tracking-[0.16em] text-accent-dark">
          {localizedFamily.tag}
        </span>
        {localizedFamily.supportingLabel ? (
          <span className="rounded-full border border-line bg-white px-4 py-2 text-sm text-steel">
            {localizedFamily.supportingLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6 rounded-[2rem] border border-line bg-white/80 p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-line bg-sand p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-steel">
                {copy.modelsInCatalog[locale]}
              </div>
              <div className="mt-3 text-lg font-semibold text-ink">
                {hasLiveCatalog ? liveCatalog?.totalModels ?? 0 : "—"}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-line bg-sand p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-steel">
                {copy.strokeRange[locale]}
              </div>
              <div className="mt-3 text-sm font-medium text-ink">
                {hasLiveCatalog
                  ? formatMetricRange(
                      liveCatalog?.strokeRange.min ?? null,
                      liveCatalog?.strokeRange.max ?? null,
                      "mm",
                    )
                  : "—"}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-line bg-sand p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-steel">
                {copy.energyPerCycle[locale]}
              </div>
              <div className="mt-3 text-sm font-medium text-ink">
                {hasLiveCatalog
                  ? formatMetricRange(
                      liveCatalog?.energyPerCycleRange.min ?? null,
                      liveCatalog?.energyPerCycleRange.max ?? null,
                      "Nm",
                    )
                  : "—"}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-sand p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-steel">
              {copy.applications[locale]}
            </div>
            <div className="mt-3 text-sm leading-7 text-ink">{localizedFamily.applications.join(" · ")}</div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold">{copy.fitFor[locale]}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-steel">
              {localizedFamily.fitFor.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-6">
            <h2 className="font-display text-2xl font-semibold">{copy.caution[locale]}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-steel">
              {localizedFamily.notFitFor.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-6">
            <h2 className="font-display text-2xl font-semibold">
              {copy.highlights[locale]}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-steel">
              {localizedFamily.highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
          <h2 className="font-display text-2xl font-semibold">{copy.exampleModels[locale]}</h2>
          <div className="mt-6 space-y-4">
            {showLiveModels ? (
              liveModels.map((model) => (
                <Link
                  key={model.id}
                  href={getLocalizedHref(locale, `/products/catalog/${model.id}`)}
                  className="block rounded-[1.5rem] border border-line bg-white px-5 py-4 hover:border-accent/40"
                >
                  <div className="font-medium">{model.model}</div>
                  <div className="mt-2 text-sm text-steel">
                    {locale === "zh-cn" ? "行程" : "Stroke"}{" "}
                    {model.strokeMm ?? "—"} mm ·
                    {locale === "zh-cn" ? "单次能量" : "Energy/cycle"}{" "}
                    {model.energyPerCycleNm ?? "—"} Nm
                  </div>
                </Link>
              ))
            ) : fallbackModels.length > 0 ? (
              fallbackModels.map((model) => {
                const localizedModel = localizeFeaturedModel(locale, model);

                return (
                <Link
                  key={model.id}
                  href={getLocalizedHref(locale, `/products/${family.slug}/${model.id}`)}
                  className="block rounded-[1.5rem] border border-line bg-white px-5 py-4 hover:border-accent/40"
                >
                  <div className="font-medium">{localizedModel.model}</div>
                  <div className="mt-2 text-sm text-steel">{localizedModel.summary}</div>
                </Link>
                );
              })
            ) : (
              <p className="text-sm leading-7 text-steel">
                {hasLiveCatalog
                  ? isChinese
                    ? "该系列的在线代表型号还在继续补充，但本页仍可帮助你先判断该系列是否适合当前项目。"
                    : "Representative online models for this family are being expanded. The guidance on this page still helps you decide whether this line matches your project."
                  : isChinese
                    ? "当前暂时无法显示型号卡片，但你仍然可以先查看本页的系列说明。"
                    : "Model cards are temporarily unavailable, but you can still review the family guidance on this page."}
              </p>
            )}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-line bg-white p-5">
            {hasLiveCatalog && (liveCatalog?.catalogAssets.length ?? 0) > 0 ? (
              <div className="mb-5 rounded-[1rem] border border-line bg-sand p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-steel">
                  {copy.relatedResources[locale]}
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {liveCatalog?.catalogAssets.map((asset) => (
                    <a
                      key={asset.id}
                      href={asset.url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-accent-dark hover:underline"
                    >
                      {asset.title ?? copy.catalogResource[locale]}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="text-xs uppercase tracking-[0.14em] text-steel">
              {copy.secondRoute[locale]}
            </div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-steel">
              <p>
                {isChinese
                  ? "如果你对运动工况的了解比对产品名更明确，可以先从工况选型路径进入，再缩小合适的缓冲器范围。"
                  : "If you know the motion conditions better than the product name, the sizing route can help narrow a suitable shock absorber path first."}
              </p>
              <Link
                href={getLocalizedHref(locale, "/selector/engineer")}
                className="inline-flex text-sm font-medium text-accent-dark"
              >
                {copy.guidedSizing[locale]}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
