import type { Locale } from "@/lib/i18n/config";
import { brand } from "@/lib/brand";
import { getIntentLabel, getKnowledgeCenterCopy } from "@/lib/i18n/page-copy";
import {
  getKnowledgeArticlePath,
  getKnowledgeCategory,
  type KnowledgeArticle,
} from "@/lib/knowledge-center/content";
import { getAbsoluteUrl } from "@/lib/seo";

type JsonLdEntity = Record<string, unknown>;

const publisher = {
  "@type": "Organization",
  name: brand.company,
  brand: { "@type": "Brand", name: brand.name },
  url: getAbsoluteUrl("/about"),
};

export function buildKnowledgeArticleJsonLd(article: KnowledgeArticle, locale: Locale) {
  const copy = getKnowledgeCenterCopy(locale);
  const category = getKnowledgeCategory(article.categorySlug);
  const categoryCopy = category ? copy.categories[category.slug] ?? category : null;
  const articlePath = getKnowledgeArticlePath(article);
  const articleUrl = getAbsoluteUrl(`/${locale}${articlePath}`);
  const articleId = `${articleUrl}#article`;
  const pageId = `${articleUrl}#webpage`;
  const breadcrumbId = `${articleUrl}#breadcrumb`;
  const faqId = `${articleUrl}#faq`;
  const categoryUrl = getAbsoluteUrl(`/${locale}/knowledge-center/${article.categorySlug}`);

  const graph: JsonLdEntity[] = [
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
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
          name: categoryCopy?.title ?? article.categorySlug,
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
      "@type": "WebPage",
      "@id": pageId,
      url: articleUrl,
      name: article.title,
      description: article.description,
      inLanguage: locale,
      breadcrumb: { "@id": breadcrumbId },
      mainEntity: { "@id": articleId },
      isPartOf: {
        "@type": "CollectionPage",
        name: copy.jsonName,
        url: getAbsoluteUrl(`/${locale}/knowledge-center`),
      },
    },
    {
      "@type": "Article",
      "@id": articleId,
      headline: article.title,
      description: article.description,
      inLanguage: locale,
      url: articleUrl,
      mainEntityOfPage: { "@id": pageId },
      articleSection: categoryCopy?.title ?? article.categorySlug,
      audience: article.audience.map((audience) => ({
        "@type": "Audience",
        audienceType: audience,
      })),
      about: [
        {
          "@type": "Thing",
          name: "Industrial shock absorber",
        },
        {
          "@type": "Thing",
          name: getIntentLabel(locale, article.intent),
        },
      ],
      isPartOf: {
        "@type": "CollectionPage",
        name: copy.jsonName,
        url: getAbsoluteUrl(`/${locale}/knowledge-center`),
      },
      publisher,
    },
    {
      "@type": "FAQPage",
      "@id": faqId,
      isPartOf: { "@id": pageId },
      mainEntity: article.questions.map((question) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: article.directAnswer,
        },
      })),
    },
  ];

  if (article.categorySlug === "calculations") {
    graph.push({
      "@type": "HowTo",
      "@id": `${articleUrl}#howto`,
      name: article.title,
      description: article.description,
      inLanguage: locale,
      isPartOf: { "@id": pageId },
      step: article.steps.map((step) => ({
        "@type": "HowToStep",
        name: step.name,
        text: step.text,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
