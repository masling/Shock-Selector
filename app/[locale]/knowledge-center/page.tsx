import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, FileQuestion, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  calculationArticles,
  knowledgeCategories,
  getKnowledgeArticlePath,
} from "@/lib/knowledge-center/content";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getIntentLabel, getKnowledgeCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getAbsoluteUrl, getLocalizedAlternates } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

type KnowledgeCenterPageProps = {
  params: Promise<{ locale: string }>;
};

const categoryIcons = [Calculator, BookOpen, Wrench, FileQuestion, Wrench, FileQuestion];

export async function generateMetadata({
  params,
}: KnowledgeCenterPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getKnowledgeCenterCopy(localeParam);

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    alternates: getLocalizedAlternates(localeParam, "/knowledge-center"),
  };
}

function knowledgeCenterJsonLd(locale: Locale) {
  const copy = getKnowledgeCenterCopy(locale);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.jsonName,
    description: copy.jsonDescription,
    inLanguage: locale,
    url: getAbsoluteUrl(`/${locale}/knowledge-center`),
    hasPart: knowledgeCategories.map((category) => {
      const categoryCopy = copy.categories[category.slug] ?? category;

      return {
        "@type": "CollectionPage",
        name: categoryCopy.title,
        description: categoryCopy.description,
        url: getAbsoluteUrl(`/${locale}/knowledge-center/${category.slug}`),
        about: getIntentLabel(locale, category.intent),
      };
    }),
  };
}

export default async function KnowledgeCenterPage({
  params,
}: KnowledgeCenterPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getKnowledgeCenterCopy(locale);
  const featuredArticles = calculationArticles.slice(0, 4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(knowledgeCenterJsonLd(locale)),
        }}
      />
      <Container className="py-10 md:py-12">
        <SectionHeading title={copy.navLabel} description={copy.heroDescription} />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={getLocalizedHref(locale, "/selector/engineer")} className={buttonVariants({ variant: "accent" })}>{copy.openSizingTool}</Link>
          <Link href={getLocalizedHref(locale, "/knowledge-center/calculations")} className={buttonVariants({ variant: "secondary" })}>{copy.browseCalculations}</Link>
        </div>

        <section className="mt-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mt-4 font-sans text-3xl font-semibold text-ink">
                {copy.sectionsTitle}
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {knowledgeCategories.map((category, index) => {
              const Icon = categoryIcons[index] ?? BookOpen;
              const categoryCopy = copy.categories[category.slug] ?? category;
              const href = `/knowledge-center/${category.slug}`;

              return (
                <Link
                  key={category.slug}
                  href={getLocalizedHref(locale, href)}
                  className="group border-t border-line py-6 transition hover:border-accent"
                >
                  <Icon className="h-6 w-6 text-accent-dark" />
                  <h3 className="mt-5 font-sans text-2xl font-semibold text-ink">
                    {categoryCopy.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-steel">
                    {categoryCopy.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-dark">
                    {copy.openSection}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12 border-t border-line pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mt-4 font-sans text-3xl font-semibold text-ink">
                {copy.featuredTitle}
              </h2>
            </div>
            <Link
              href={getLocalizedHref(locale, "/knowledge-center/calculations")}
              className={cn(buttonVariants({ variant: "secondary" }), "w-fit")}
            >
              {copy.viewAll}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                href={getLocalizedHref(locale, getKnowledgeArticlePath(article))}
                className="border-t border-line py-5 transition hover:text-accent"
              >
                <h3 className="font-sans text-xl font-semibold text-ink">
                  {article.shortTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-steel">{article.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
