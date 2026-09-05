import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  calculationArticles,
  getKnowledgeArticlePath,
} from "@/lib/knowledge-center/content";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getIntentLabel, getKnowledgeCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getAbsoluteUrl, getLocalizedAlternates } from "@/lib/seo";

type CalculationsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CalculationsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getKnowledgeCenterCopy(localeParam);

  return {
    title: copy.calculationsMetadataTitle,
    description: copy.calculationsMetadataDescription,
    alternates: getLocalizedAlternates(localeParam, "/knowledge-center/calculations"),
  };
}

function calculationsJsonLd(locale: Locale) {
  const copy = getKnowledgeCenterCopy(locale);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.calculationsJsonName,
    description: copy.calculationsJsonDescription,
    inLanguage: locale,
    url: getAbsoluteUrl(`/${locale}/knowledge-center/calculations`),
    itemListElement: calculationArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        name: article.title,
        description: article.description,
        url: getAbsoluteUrl(`/${locale}${getKnowledgeArticlePath(article)}`),
        about: getIntentLabel(locale, article.intent),
      },
    })),
  };
}

export default async function CalculationsPage({ params }: CalculationsPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getKnowledgeCenterCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(calculationsJsonLd(locale)),
        }}
      />
      <Container className="py-10 md:py-12">
        <section className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <SectionHeading
            eyebrow={copy.calculationsHeroEyebrow}
            title={copy.calculationsHeroTitle}
            description={copy.calculationsHeroDescription}
          />
          <div className="rounded-xl border border-line bg-white p-6">
            <Calculator className="h-7 w-7 text-accent-dark" />
            <h2 className="mt-5 font-sans text-2xl font-semibold text-ink">
              {copy.answerToInquiryTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-steel">
              {copy.answerToInquiryDescription}
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-5">
          {calculationArticles.map((article, index) => (
            <Link
              key={article.slug}
              href={getLocalizedHref(locale, getKnowledgeArticlePath(article))}
              className="group rounded-xl border border-line bg-white p-7 transition hover:border-accent"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>Q{index + 1}</Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-steel">
                      {getIntentLabel(locale, article.intent)}
                    </span>
                  </div>
                  <h2 className="mt-4 font-sans text-3xl font-semibold text-ink">
                    {article.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-steel">
                    {article.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-steel transition group-hover:translate-x-1 group-hover:text-accent-dark" />
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {article.questions.slice(0, 3).map((question) => (
                  <div
                    key={question}
                    className="flex gap-2 rounded-md border border-line bg-sand/70 p-3 text-sm leading-6 text-steel"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent-dark" />
                    {question}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-16 rounded-xl border border-line bg-ink p-7 text-white">
          <h2 className="font-sans text-3xl font-semibold">
            {copy.completeDataTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
            {copy.completeDataDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={getLocalizedHref(locale, "/selector/engineer")}
              className={buttonVariants({ variant: "accent" })}
            >
              {copy.openSizingTool}
            </Link>
            <Link
              href={getLocalizedHref(locale, "/contact")}
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-medium text-white hover:bg-white/14"
            >
              {copy.sendApplicationData}
            </Link>
          </div>
        </section>
      </Container>
    </>
  );
}
