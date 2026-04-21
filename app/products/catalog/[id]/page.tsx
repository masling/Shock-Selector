/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { getRequestLocale } from "@/lib/i18n/request";
import { getProductDetailById } from "@/lib/products/product-queries";

type CatalogProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CatalogProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetailById(id, "en");

  return {
    title: product ? product.model : "Product Details",
  };
}

export default async function CatalogProductPage({
  params,
}: CatalogProductPageProps) {
  const locale = await getRequestLocale();
  const isChinese = locale === "zh-cn";
  const { id } = await params;
  const product = await getProductDetailById(id, locale);

  if (!product) {
    notFound();
  }

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: isChinese ? "产品中心" : "Products", href: "/products" },
        ...(product.familySlug ? [{ label: product.familyName ?? product.familySlug, href: `/products/${product.familySlug}` }] : []),
        { label: product.model },
      ]} />
      <div className="rounded-[2rem] border border-line bg-white/80 p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-accent-dark">
          {isChinese ? "型号详情" : "Model details"}
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold">{product.model}</h1>
        <p className="mt-3 text-base text-steel">
          {isChinese
            ? "这里展示该型号的技术数据，便于选型、比较和初步评估。"
            : "Technical data for this model is shown here to support selection, comparison and review."}
        </p>

        {product.primaryImageUrl ? (
          <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-line bg-sand p-4">
            <img
              src={product.primaryImageUrl}
              alt={product.primaryImageTitle ?? product.model}
              className="h-auto w-full rounded-[1.25rem] object-cover"
            />
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-3 xl:grid-cols-5">
          {[
            [isChinese ? "产品家族" : "Product family", product.familyName],
            [isChinese ? "系列代码" : "Series code", product.seriesCode],
            [isChinese ? "类型" : "Type", product.typeLabel],
            [isChinese ? "行程 (mm)" : "Stroke (mm)", product.strokeMm],
            [isChinese ? "单次能量" : "Energy / cycle", product.energyPerCycleNm],
            [isChinese ? "小时能量" : "Energy / hour", product.energyPerHourNm],
            [isChinese ? "螺纹尺寸" : "Thread size", product.threadSize],
            [isChinese ? "冲击力" : "Impact force", product.maxImpactForceN],
            [isChinese ? "推进力" : "Thrust force", product.maxThrustForceN],
            [isChinese ? "总长度" : "Total length", product.totalLengthMm],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.5rem] border border-line bg-[#e9ede4] p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-steel">{label}</div>
              <div className="mt-3 text-sm font-medium text-ink">{value ?? "—"}</div>
            </div>
          ))}
        </div>

        {product.familyCatalogs.length > 0 ? (
          <div className="mt-10 rounded-[1.75rem] border border-line bg-sand p-6">
            <div className="text-xs uppercase tracking-[0.14em] text-steel">
              {isChinese ? "相关资料下载" : "Related downloads"}
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {product.familyCatalogs.map((catalog) => (
                <a
                  key={catalog.id}
                  href={catalog.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-accent-dark hover:underline"
                >
                  {catalog.title ?? (isChinese ? "产品资料" : "Catalog resource")}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  );
}
