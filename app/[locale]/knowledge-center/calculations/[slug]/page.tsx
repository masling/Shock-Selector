import { KnowledgeArticleContent } from "@/components/marketing/knowledge-article-content";
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
} from "@/lib/knowledge-center/content";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import {
  getIntentLabel,
  getKnowledgeCenterCopy,
  getKnowledgeRelatedLinkLabel,
} from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { buildKnowledgeArticleJsonLd } from "@/lib/knowledge-center/structured-data";
import { getLocalizedAlternates } from "@/lib/seo";
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

  return <KnowledgeArticleContent article={article} locale={localeParam} />;
}
