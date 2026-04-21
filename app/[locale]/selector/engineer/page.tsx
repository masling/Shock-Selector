import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EngineerSizingClient } from "@/components/selector/engineer-sizing-client";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { localizeScenarioCatalog } from "@/lib/i18n/scenario-copy";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getScenarioCatalog } from "@/lib/scenarios/registry";

type EngineerSizingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: EngineerSizingPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return { title: copy.metadata.engineerTitle };
}

export default async function EngineerSizingPage({
  params,
}: EngineerSizingPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);
  const scenarioCatalog = localizeScenarioCatalog(getScenarioCatalog(), locale);

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: copy.engineer.eyebrow },
      ]} />
      <SectionHeading
        eyebrow={copy.engineer.eyebrow}
        title={copy.engineer.title}
        description={copy.engineer.description}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
          <h2 className="font-display text-2xl font-semibold">{copy.engineer.motionGroupsTitle}</h2>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-steel">
            {scenarioCatalog.entries.map((entry) => (
              <li key={entry.key}>• {entry.name}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-line bg-white/80 p-8">
            <h2 className="font-display text-2xl font-semibold">{copy.engineer.howItWorksTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-steel">
              {copy.engineer.howItWorksDescription}
            </p>
          </div>
          <div className="rounded-[2rem] border border-line bg-white/80 p-8">
            <h2 className="font-display text-2xl font-semibold">{copy.engineer.whatYouGetTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-steel">
              {copy.engineer.whatYouGetDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <EngineerSizingClient locale={locale} copy={copy.engineer} />
      </div>
    </Container>
  );
}
