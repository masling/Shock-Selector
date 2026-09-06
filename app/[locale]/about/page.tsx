import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, FileCheck2 } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { getBrandCompanyName } from "@/lib/brand";
import { isLocale } from "@/lib/i18n/config";
import { getAboutPageCopy } from "@/lib/i18n/about-page-copy";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getLocalizedAlternates } from "@/lib/seo";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

const evidenceImages = [
  "/company/evidence/ekd-trademark-redacted.jpg",
  "/company/evidence/rohs-test-redacted.jpg",
  "/company/evidence/design-patent-redacted.jpg",
  "/company/evidence/ce-conformity-redacted.jpg",
  "/company/evidence/iso-9001-redacted.jpg",
] as const;

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return {
    title: copy.metadata.aboutTitle,
    description: copy.about.description,
    alternates: getLocalizedAlternates(localeParam, "/about"),
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const copy = getSiteCopy(localeParam);
  const about = getAboutPageCopy(localeParam);
  const companyName = getBrandCompanyName(localeParam);

  return (
    <Container className="py-10 md:py-12">
      <section className="grid items-center gap-10 border-b border-line pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-16 lg:pb-16">
        <div>
          <SectionHeading eyebrow={copy.about.eyebrow} title={copy.about.title} description={copy.about.description} />
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-lg font-semibold text-ink">{companyName}</p>
            <p className="mt-1 text-sm text-steel">{about.location}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-white p-4 sm:p-5">
          <div className="flex min-h-56 items-center justify-center bg-mist p-4">
            <Image src="/products/representative-shock-absorber.jpg" alt="EKD industrial shock absorber" width={900} height={900} className="product-image h-52 w-full" priority />
          </div>
          <div className="flex min-h-56 items-center justify-center bg-mist p-4">
            <Image src="/products/representative-wire-rope-isolator.jpg" alt="EKD wire-rope vibration isolator" width={900} height={900} className="product-image h-52 w-full" priority />
          </div>
        </div>
      </section>

      <section className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink">{copy.about.profileTitle}</h2>
          {copy.about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-5 max-w-[70ch] text-base leading-8 text-steel">{paragraph}</p>
          ))}
          <ul className="mt-7 space-y-3 border-t border-line pt-6 text-sm leading-7 text-ink">
            {copy.about.highlights.map((item) => <li key={item} className="flex gap-3"><BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" /><span>{item}</span></li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink">{about.capabilitiesTitle}</h2>
          <p className="mt-4 max-w-[68ch] text-base leading-8 text-steel">{about.capabilitiesDescription}</p>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {about.capabilities.map((item) => (
              <div key={item.title} className="grid gap-2 py-6 sm:grid-cols-[minmax(150px,0.45fr)_1fr] sm:gap-8">
                <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                <p className="text-sm leading-7 text-steel">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-ink px-5 py-9 text-white sm:px-8 lg:px-10 lg:py-11" aria-labelledby="company-evidence-title">
        <div>
          <h2 id="company-evidence-title" className="font-display text-3xl font-semibold leading-tight">{about.evidenceTitle}</h2>
          <p className="mt-4 max-w-[65ch] text-sm leading-7 text-white/80">{about.evidenceDescription}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {about.evidence.map((item, index) => (
            <figure key={item.title} className="overflow-hidden rounded-lg border border-white/15 bg-white/[0.06]">
              <div className="aspect-[3/4] bg-white p-2">
                <Image src={evidenceImages[index]} alt={item.title} width={720} height={1020} className="h-full w-full object-contain" />
              </div>
              <figcaption className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-6 text-white">{item.title}</h3>
                  <span className={item.status === "current" ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink" : "inline-flex shrink-0 items-center gap-1 rounded-full border border-white/35 px-2.5 py-1 text-[11px] font-semibold text-white"}>
                    <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />{item.statusText}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-xs leading-6 text-white/65">{about.disclosure}</p>
      </section>

      <section className="flex flex-col gap-5 border-b border-line py-12 sm:flex-row sm:items-center sm:justify-between lg:py-14">
        <div>
          <h2 className="text-2xl font-semibold text-ink">{about.contactTitle}</h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-7 text-steel">{about.contactDescription}</p>
        </div>
        <Link href={getLocalizedHref(localeParam, "/contact?request=documentation")} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-dark">
          {about.contactAction}<ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </Container>
  );
}
