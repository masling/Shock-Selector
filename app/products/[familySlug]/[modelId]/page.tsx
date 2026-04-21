import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { featuredModels, getFamilyBySlug, getModelById } from "@/lib/content/site";
import {
  getLocalizedProductFamilyName,
  localizeFeaturedModel,
} from "@/lib/i18n/product-copy";
import { getRequestLocale } from "@/lib/i18n/request";

type ProductDetailPageProps = {
  params: Promise<{ familySlug: string; modelId: string }>;
};

export async function generateStaticParams() {
  return featuredModels.map((model) => ({
    familySlug: model.familySlug,
    modelId: model.id,
  }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { modelId } = await params;
  const product = getModelById(modelId);

  return {
    title: product ? product.model : "Product",
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const locale = await getRequestLocale();
  const isChinese = locale === "zh-cn";
  const { familySlug, modelId } = await params;
  const family = getFamilyBySlug(familySlug);
  const product = getModelById(modelId);

  if (!family || !product || product.familySlug !== familySlug) {
    notFound();
  }

  const localizedProduct = localizeFeaturedModel(locale, product);

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: isChinese ? "产品中心" : "Products", href: "/products" },
        { label: getLocalizedProductFamilyName(locale, family.slug, family.name), href: `/products/${family.slug}` },
        { label: localizedProduct.model },
      ]} />
      <div className="rounded-[2rem] border border-line bg-white/80 p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-accent-dark">
          {getLocalizedProductFamilyName(locale, family.slug, family.name)}
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold">{localizedProduct.model}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-steel">{localizedProduct.summary}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {[
            [isChinese ? "行程" : "Stroke", localizedProduct.stroke],
            [isChinese ? "能量" : "Energy", localizedProduct.energy],
            [isChinese ? "螺纹" : "Thread", localizedProduct.thread],
            [isChinese ? "力值" : "Force", localizedProduct.force],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-line bg-[#e9ede4] p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-steel">{label}</div>
              <div className="mt-3 text-sm font-medium text-ink">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
