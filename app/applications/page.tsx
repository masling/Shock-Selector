import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { applicationSectors } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Applications",
};

type ApplicationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sectorKeyByTitle: Record<string, string> = {
  "PET Blowing Machinery": "pet-blowing-machinery",
  "Automotive Manufacturing": "automotive-manufacturing",
  "Automated Warehouses": "automated-warehouses",
  "Port and Lifting Equipment": "port-and-lifting-equipment",
};

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedSector =
    typeof resolvedSearchParams.sector === "string" ? resolvedSearchParams.sector : null;

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Applications"
        title="Common applications for EKD shock absorbers and buffers."
        description="Browse typical machine environments to see where different product families are commonly used."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {applicationSectors.map((sector) => (
          <article
            key={sector.title}
            className={[
              "rounded-[2rem] border bg-white/80 p-7",
              sectorKeyByTitle[sector.title] === selectedSector
                ? "border-accent bg-[#eef1ea]"
                : "border-line",
            ].join(" ")}
          >
            <h2 className="font-display text-2xl font-semibold">{sector.title}</h2>
            <p className="mt-4 text-sm leading-7 text-steel">{sector.description}</p>
            <Link href={sector.href} className="mt-6 inline-flex text-sm font-medium text-accent-dark hover:text-accent">
              Explore options
            </Link>
          </article>
        ))}
      </div>
    </Container>
  );
}
