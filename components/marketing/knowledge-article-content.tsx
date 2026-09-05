import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getKnowledgeCenterCopy, getKnowledgeRelatedLinkLabel } from "@/lib/i18n/page-copy";
import { getSiteUiCopy } from "@/lib/i18n/site-ui-copy";
import { getKnowledgeCategory, type KnowledgeArticle } from "@/lib/knowledge-center/content";
import { buildKnowledgeArticleJsonLd } from "@/lib/knowledge-center/structured-data";

export function KnowledgeArticleContent({ article, locale }: { article: KnowledgeArticle; locale: Locale }) {
  const copy = getKnowledgeCenterCopy(locale);
  const ui = getSiteUiCopy(locale);
  const category = getKnowledgeCategory(article.categorySlug)!;
  const categoryCopy = copy.categories[category.slug] ?? category;
  const href = (path: string) => getLocalizedHref(locale, path);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildKnowledgeArticleJsonLd(article, locale)) }} />
    <Container className="py-10 md:py-12">
      <Breadcrumb items={[{ label: copy.navLabel, href: href("/knowledge-center") }, { label: categoryCopy.title, href: href(`/knowledge-center/${category.slug}`) }, { label: article.shortTitle }]} />
      <header className="mt-7 max-w-4xl">
        <h1 lang="en" className="text-3xl font-semibold leading-tight md:text-[2.65rem] md:leading-[1.2]">{article.title}</h1>
        <p lang="en" className="mt-4 max-w-3xl text-base leading-7 text-steel">{article.description}</p>
        {locale !== "en" && <p className="mt-3 text-sm text-steel">{ui.englishContent}</p>}
      </header>
      <div className="mt-9 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-16">
        <article className="min-w-0 max-w-4xl space-y-10">
          <section className="rounded-xl bg-mist p-5 sm:p-7"><h2 className="text-2xl font-semibold">{copy.directAnswer}</h2><p lang="en" className="mt-3 text-base leading-8 text-ink">{article.directAnswer}</p></section>
          <section><h2 className="text-2xl font-semibold">{copy.questionsAnswered}</h2><ul lang="en" className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-steel">{article.questions.map(q=><li key={q}>{q}</li>)}</ul></section>
          <section><h2 className="text-2xl font-semibold">{copy.requiredInputs}</h2><ul lang="en" className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">{article.requiredInputs.map(input=><li key={input} className="border-b border-line py-2 text-sm leading-6 text-steel">{input.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, x=>x.toUpperCase())}</li>)}</ul></section>
          {article.formulas.length > 0 && <section><h2 className="text-2xl font-semibold">{copy.formulaLogic}</h2><div lang="en" className="mt-5 space-y-5">{article.formulas.map(formula=><div key={formula.name} className="border-t border-line pt-5"><h3 className="text-lg font-semibold">{formula.name}</h3><code className="my-3 block overflow-x-auto rounded-md bg-sand p-4 text-base font-semibold">{formula.formula}</code><p className="text-sm leading-7 text-steel">{formula.explanation}</p><p className="mt-2 text-sm text-steel">{copy.unit}: {formula.unit}</p></div>)}</div></section>}
          <section><h2 className="text-2xl font-semibold">{copy.reviewSteps}</h2><ol lang="en" className="mt-5 list-decimal space-y-5 pl-5">{article.steps.map(step=><li key={step.name} className="pl-2"><h3 className="text-base font-semibold">{step.name}</h3><p className="mt-2 text-base leading-7 text-steel">{step.text}</p></li>)}</ol></section>
          <section><h2 className="text-2xl font-semibold">{copy.commonMistakes}</h2><ul lang="en" className="mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-steel">{article.commonMistakes.map(m=><li key={m}>{m}</li>)}</ul></section>
          <section className="border-t border-line pt-6"><h2 className="text-xl font-semibold">{copy.technicalNotes}</h2><ul lang="en" className="mt-4 space-y-3 text-sm leading-7 text-steel">{article.sourceNotes.map(n=><li key={n}>{n}</li>)}</ul></section>
        </article>
        <aside className="rounded-xl border border-line bg-sand p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-semibold">{copy.moveToShortlistTitle}</h2><p className="mt-3 text-sm leading-7 text-steel">{copy.moveToShortlistDescription}</p>
          <Link href={href("/selector/engineer")} className={buttonVariants({ variant: "accent", className: "mt-5 w-full" })}>{copy.openSizingTool}</Link>
          <div className="mt-5 divide-y divide-line">{article.relatedLinks.filter(link=>link.href !== "/selector/engineer").map(link=><Link key={link.href} href={href(link.href)} className="flex min-h-11 items-center justify-between gap-3 py-3 text-sm leading-6 text-accent hover:underline"><span>{getKnowledgeRelatedLinkLabel(locale, link.href)}</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}</div>
        </aside>
      </div>
    </Container>
  </>;
}
