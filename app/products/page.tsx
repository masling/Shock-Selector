import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { findCatalogFamilies } from "@/lib/catalog/catalog-repository";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const families = await findCatalogFamilies("en");

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Product catalog"
        title="PDF-backed shock absorber and vibration isolation catalog"
        description="Browse product families, technical series and model tables rebuilt from EKD catalog PDFs and selector data."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {families.map((family) => {
          const translation = family.translations[0];
          return (
            <Link
              key={family.id}
              href={`/products/${family.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                {translation?.tag ?? "Product family"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{translation?.name ?? family.slug}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{translation?.summary}</p>
              <p className="mt-5 text-sm font-medium text-slate-900">{family.series.length} technical series</p>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
