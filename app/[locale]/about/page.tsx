import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return { title: copy.metadata.aboutTitle };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const copy = getSiteCopy(localeParam);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.about.eyebrow}
        title={copy.about.title}
        description={copy.about.description}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-line bg-white/80 p-8">
          <h2 className="font-display text-2xl font-semibold">{copy.about.profileTitle}</h2>
          {copy.about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-5 text-sm leading-8 text-steel">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="space-y-4">
          {copy.about.highlights.map((item) => (
            <div
              key={item}
              className="rounded-[1.75rem] border border-line bg-[#e9ede4] p-6 text-sm leading-7 text-steel"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
