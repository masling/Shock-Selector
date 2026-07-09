import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getIntentLabel, getKnowledgeCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import {
  getKnowledgeArticlePath,
  getKnowledgeArticlesByCategory,
  getKnowledgeCategory,
  knowledgeCategories,
} from "@/lib/knowledge-center/content";
import { getAbsoluteUrl, getLocalizedAlternates } from "@/lib/seo";

type KnowledgeCategoryPageProps = {
  params: Promise<{ locale: string; categorySlug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    knowledgeCategories
      .filter((category) => category.slug !== "calculations")
      .map((category) => ({
        locale,
        categorySlug: category.slug,
      })),
  );
}

export async function generateMetadata({
  params,
}: KnowledgeCategoryPageProps): Promise<Metadata> {
  const { locale: localeParam, categorySlug } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const category = getKnowledgeCategory(categorySlug);

  if (!category || category.slug === "calculations") {
    return {};
  }

  const copy = getKnowledgeCenterCopy(localeParam);
  const categoryCopy = copy.categories[category.slug] ?? category;

  return {
    title: categoryCopy.title,
    description: categoryCopy.description,
    alternates: getLocalizedAlternates(localeParam, `/knowledge-center/${category.slug}`),
  };
}

function categoryJsonLd(locale: Locale, categorySlug: string) {
  const category = getKnowledgeCategory(categorySlug);

  if (!category) return null;

  const copy = getKnowledgeCenterCopy(locale);
  const categoryCopy = copy.categories[category.slug] ?? category;
  const articles = getKnowledgeArticlesByCategory(category.slug);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryCopy.title,
    description: categoryCopy.description,
    inLanguage: locale,
    url: getAbsoluteUrl(`/${locale}/knowledge-center/${category.slug}`),
    itemListElement: articles.map((article, index) => ({
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

export default async function KnowledgeCategoryPage({
  params,
}: KnowledgeCategoryPageProps) {
  const { locale: localeParam, categorySlug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const category = getKnowledgeCategory(categorySlug);

  if (!category || category.slug === "calculations") {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getKnowledgeCenterCopy(locale);
  const categoryCopy = copy.categories[category.slug] ?? category;
  const articles = getKnowledgeArticlesByCategory(category.slug);
  const jsonLd = categoryJsonLd(locale, category.slug);

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <Container className="py-16">
        <SectionHeading
          eyebrow={copy.heroEyebrow}
          title={categoryCopy.title}
          description={categoryCopy.description}
        />

        <section className="mt-12 grid gap-5">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={getLocalizedHref(locale, getKnowledgeArticlePath(article))}
              className="group rounded-[2rem] border border-line bg-white/80 p-7 transition hover:-translate-y-1 hover:shadow-panel"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{index + 1}</Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-steel">
                      {getIntentLabel(locale, article.intent)}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold text-ink">
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
                    className="flex gap-2 rounded-[1rem] border border-line bg-sand/70 p-3 text-sm leading-6 text-steel"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent-dark" />
                    {question}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </section>
      </Container>
    </>
  );
}
