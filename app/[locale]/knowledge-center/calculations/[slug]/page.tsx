import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  calculationArticles,
  getKnowledgeArticle,
  getKnowledgeArticlePath,
  type KnowledgeArticle,
} from "@/lib/knowledge-center/content";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import {
  getIntentLabel,
  getKnowledgeCenterCopy,
  getKnowledgeRelatedLinkLabel,
} from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getAbsoluteUrl, getLocalizedAlternates } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

type CalculationArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    calculationArticles.map((article) => ({
      locale,
      slug: article.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: CalculationArticlePageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const article = getKnowledgeArticle(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    alternates: getLocalizedAlternates(
      localeParam,
      `/knowledge-center/calculations/${article.slug}`,
    ),
  };
}

function articleJsonLd(article: KnowledgeArticle, locale: Locale) {
  const articlePath = getKnowledgeArticlePath(article);
  const articleUrl = getAbsoluteUrl(`/${locale}${articlePath}`);
  const categoryUrl = getAbsoluteUrl(`/${locale}/knowledge-center/calculations`);
  const copy = getKnowledgeCenterCopy(locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: copy.navLabel,
            item: getAbsoluteUrl(`/${locale}/knowledge-center`),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: copy.calculationsLabel,
            item: categoryUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
      {
        "@type": "Article",
        headline: article.title,
        description: article.description,
        inLanguage: locale,
        url: articleUrl,
        articleSection: copy.articleSectionName,
        audience: article.audience.map((audience) => ({
          "@type": "Audience",
          audienceType: audience,
        })),
        about: [
          getIntentLabel(locale, article.intent),
          ...article.requiredInputs,
          ...article.formulas.map((formula) => formula.name),
        ],
        isPartOf: {
          "@type": "CollectionPage",
          name: copy.jsonName,
          url: getAbsoluteUrl(`/${locale}/knowledge-center`),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: article.questions.map((question) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: article.directAnswer,
          },
        })),
      },
      {
        "@type": "HowTo",
        name: article.title,
        description: article.description,
        step: article.steps.map((step) => ({
          "@type": "HowToStep",
          name: step.name,
          text: step.text,
        })),
      },
    ],
  };
}

export default async function CalculationArticlePage({
  params,
}: CalculationArticlePageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const article = getKnowledgeArticle(slug);

  if (!article || article.categorySlug !== "calculations") {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getKnowledgeCenterCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article, locale)),
        }}
      />
      <Container className="py-16">
        <article className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-3">
            <Link
              href={getLocalizedHref(locale, "/knowledge-center")}
              className="text-sm font-medium text-steel hover:text-ink"
            >
              {copy.navLabel}
            </Link>
            <span className="text-sm text-steel">/</span>
            <Link
              href={getLocalizedHref(locale, "/knowledge-center/calculations")}
              className="text-sm font-medium text-steel hover:text-ink"
            >
              {copy.calculationsLabel}
            </Link>
          </div>

          <header className="mt-8 rounded-[2rem] border border-line bg-white/80 p-8 shadow-sm">
            <Badge>{getIntentLabel(locale, article.intent)}</Badge>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight text-ink md:text-6xl">
              {article.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-steel">
              {article.description}
            </p>
          </header>

          <section className="mt-8 rounded-[2rem] border border-accent/20 bg-[#eef1ea] p-7">
            <h2 className="font-display text-3xl font-semibold text-ink">
              {copy.directAnswer}
            </h2>
            <p className="mt-4 text-base leading-8 text-steel">{article.directAnswer}</p>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-line bg-white/80 p-7">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {copy.questionsAnswered}
              </h2>
              <ul className="mt-5 space-y-3">
                {article.questions.map((question) => (
                  <li key={question} className="flex gap-3 text-sm leading-6 text-steel">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
                    {question}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-line bg-white/80 p-7">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {copy.requiredInputs}
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {article.requiredInputs.map((input) => (
                  <span
                    key={input}
                    className="rounded-full border border-line bg-sand px-3 py-1 text-xs font-medium text-steel"
                  >
                    {input}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {article.formulas.length > 0 ? (
            <section className="mt-8 rounded-[2rem] border border-line bg-white/80 p-7">
              <h2 className="font-display text-3xl font-semibold text-ink">
                {copy.formulaLogic}
              </h2>
              <div className="mt-6 grid gap-4">
                {article.formulas.map((formula) => (
                  <div
                    key={formula.name}
                    className="rounded-[1.5rem] border border-line bg-sand/70 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-display text-xl font-semibold text-ink">
                          {formula.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-steel">
                          {formula.explanation}
                        </p>
                      </div>
                      <code className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
                        {formula.formula}
                      </code>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-steel">
                      {copy.unit}: {formula.unit}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-line bg-white/80 p-7">
              <h2 className="font-display text-3xl font-semibold text-ink">
                {copy.calculationSteps}
              </h2>
              <ol className="mt-6 space-y-4">
                {article.steps.map((step, index) => (
                  <li key={step.name} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-ink">{step.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-steel">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[2rem] border border-line bg-white/80 p-7">
              <h2 className="font-display text-3xl font-semibold text-ink">
                {copy.commonMistakes}
              </h2>
              <ul className="mt-6 space-y-3">
                {article.commonMistakes.map((mistake) => (
                  <li key={mistake} className="rounded-[1rem] border border-line bg-sand/70 p-4 text-sm leading-6 text-steel">
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-line bg-white/80 p-7">
            <h2 className="font-display text-3xl font-semibold text-ink">
              {copy.catalogSourceNotes}
            </h2>
            <ul className="mt-5 space-y-3">
              {article.sourceNotes.map((note) => (
                <li key={note} className="text-sm leading-7 text-steel">
                  {note}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-[2rem] border border-line bg-ink p-7 text-white">
            <h2 className="font-display text-3xl font-semibold">
              {copy.moveToShortlistTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              {copy.moveToShortlistDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {article.relatedLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={getLocalizedHref(locale, link.href)}
                  className={cn(
                    index === 0
                      ? buttonVariants({ variant: "accent" })
                      : "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-medium text-white hover:bg-white/14",
                  )}
                >
                  {getKnowledgeRelatedLinkLabel(locale, link.href)}
                  {index !== 0 ? <ArrowRight className="h-4 w-4" /> : null}
                </Link>
              ))}
            </div>
          </section>
        </article>
      </Container>
    </>
  );
}
