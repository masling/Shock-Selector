import { KnowledgeArticleContent } from "@/components/marketing/knowledge-article-content";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import {
  getIntentLabel,
  getKnowledgeCenterCopy,
  getKnowledgeRelatedLinkLabel,
} from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import {
  getKnowledgeArticle,
  getKnowledgeArticlePath,
  getKnowledgeCategory,
  knowledgeArticles,
} from "@/lib/knowledge-center/content";
import { buildKnowledgeArticleJsonLd } from "@/lib/knowledge-center/structured-data";
import { getLocalizedAlternates } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

type KnowledgeArticlePageProps = {
  params: Promise<{ locale: string; categorySlug: string; slug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    knowledgeArticles
      .filter((article) => article.categorySlug !== "calculations")
      .map((article) => ({
        locale,
        categorySlug: article.categorySlug,
        slug: article.slug,
      })),
  );
}

export async function generateMetadata({
  params,
}: KnowledgeArticlePageProps): Promise<Metadata> {
  const { locale: localeParam, categorySlug, slug } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const article = getKnowledgeArticle(slug);

  if (!article || article.categorySlug !== categorySlug || article.categorySlug === "calculations") {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    alternates: getLocalizedAlternates(localeParam, getKnowledgeArticlePath(article) as `/${string}`),
  };
}

export default async function KnowledgeArticlePage({
  params,
}: KnowledgeArticlePageProps) {
  const { locale: localeParam, categorySlug, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const article = getKnowledgeArticle(slug);
  const category = getKnowledgeCategory(categorySlug);

  if (!article || !category || article.categorySlug !== categorySlug || category.slug === "calculations") {
    notFound();
  }

  return <KnowledgeArticleContent article={article} locale={localeParam} />;
}
