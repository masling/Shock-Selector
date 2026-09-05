import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedAlternates } from "@/lib/seo";

type ApplicationsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const applicationSectorRoutes = [
  {
    key: "pet-blowing-machinery",
    href: "/products/shock-absorbers",
  },
  {
    key: "automotive-manufacturing",
    href: "/products/shock-absorbers",
  },
  {
    key: "automated-warehouses",
    href: "/products/heavy-duty-buffers",
  },
  {
    key: "port-and-lifting-equipment",
    href: "/products/heavy-duty-buffers",
  },
] as const;

export async function generateMetadata({
  params,
}: ApplicationsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return {
    title: copy.metadata.applicationsTitle,
    description: copy.applications.description,
    alternates: getLocalizedAlternates(localeParam, "/applications"),
  };
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
    <Container className="py-10 md:py-12">
      <SectionHeading
        eyebrow={copy.applications.eyebrow}
        title={copy.applications.title}
        description={copy.applications.description}
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {copy.applications.sectors.map((sector, index) => {
          const sectorRoute = applicationSectorRoutes[index];

          return (
            <article
              key={sectorRoute?.key ?? sector.title}
              className={[
                "rounded-xl border bg-white p-7",
                sectorRoute?.key === selectedSector
                  ? "border-accent bg-mist"
                  : "border-line",
              ].join(" ")}
            >
              <h2 className="font-sans text-2xl font-semibold">{sector.title}</h2>
              <p className="mt-4 text-sm leading-7 text-steel">{sector.description}</p>
              <Link
                href={getLocalizedHref(locale, sectorRoute?.href ?? sector.href)}
                className="mt-6 inline-flex text-sm font-medium text-accent-dark hover:text-accent"
              >
                {copy.applications.explore}
              </Link>
            </article>
          );
        })}
      </div>
    </Container>
  );
}
