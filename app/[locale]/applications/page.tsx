import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getSiteCopy } from "@/lib/i18n/site-copy";

type ApplicationsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const sectorKeyByTitle: Record<string, string> = {
  "PET 吹瓶机械": "pet-blowing-machinery",
  "汽车制造": "automotive-manufacturing",
  "自动化仓储": "automated-warehouses",
  "港口与起重设备": "port-and-lifting-equipment",
  "Port and Lifting Equipment": "port-and-lifting-equipment",
};

export async function generateMetadata({
  params,
}: ApplicationsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return { title: copy.metadata.applicationsTitle };
}

export default async function ApplicationsPage({
  params,
  searchParams,
}: ApplicationsPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedSector =
    typeof resolvedSearchParams.sector === "string" ? resolvedSearchParams.sector : null;

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.applications.eyebrow}
        title={copy.applications.title}
        description={copy.applications.description}
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {copy.applications.sectors.map((sector) => (
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
            <Link
              href={getLocalizedHref(locale, sector.href)}
              className="mt-6 inline-flex text-sm font-medium text-accent-dark hover:text-accent"
            >
              {copy.applications.explore}
            </Link>
          </article>
        ))}
      </div>
    </Container>
  );
}
