import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Calculator, Mail, MessageCircle, Search, SlidersHorizontal, Wrench } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { findCatalogFamilies } from "@/lib/catalog/catalog-repository";
import { buildHomeCatalog } from "@/lib/catalog/home-catalog";
import { familyVisualModels, productImageUrl } from "@/lib/catalog/product-media";
import { getInquiryRequestHref } from "@/lib/contact/inquiry-context";
import type { Locale } from "@/lib/i18n/config";
import { getHomePageCopy } from "@/lib/i18n/home-page-copy";
import { getKnowledgeCenterCopy } from "@/lib/i18n/page-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { localizeScenarioCatalog } from "@/lib/i18n/scenario-copy";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getKnowledgeArticle, getKnowledgeArticlePath, knowledgeCategories } from "@/lib/knowledge-center/content";
import { getScenarioCatalog } from "@/lib/scenarios/registry";
import { cn } from "@/lib/utils/cn";

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = getHomePageCopy(locale);
  const knowledgeCopy = getKnowledgeCenterCopy(locale);
  const siteCopy = getSiteCopy(locale);
  const motions = localizeScenarioCatalog(getScenarioCatalog(), locale).entries;
  let families: ReturnType<typeof buildHomeCatalog> = [];
  let unavailable = false;
  try {
    families = buildHomeCatalog(await findCatalogFamilies(locale), locale);
  } catch {
    unavailable = true;
    console.error("Homepage product catalog could not be loaded.");
  }
  const href = (path: string) => getLocalizedHref(locale, path);
  const engineerHref = href("/selector/engineer");
  const heroImages = ["EK42X50", "OVTW32-50-10"].map((model) => ({ model, src: productImageUrl(model) })).filter((image) => image.src);
  const hasPreviewImages = heroImages.length > 0 || families.some((family) => {
    const model = familyVisualModels[family.slug];
    return model && productImageUrl(model);
  });
  const questions = [
    { slug: "what-data-is-needed-for-shock-absorber-calculation", label: copy.dataQuestion },
    { slug: "how-to-check-energy-per-hour-for-shock-absorber", label: copy.energyQuestion },
  ].flatMap(({ slug, label }) => {
    const article = getKnowledgeArticle(slug);
    return article ? [{ href: href(getKnowledgeArticlePath(article)), label }] : [];
  });

  return (
    <div className="bg-white">
      <section className="border-b border-line bg-sand">
        <Container className="max-w-[1440px] flex flex-col justify-between gap-5 py-8 sm:flex-row sm:items-center md:gap-10 md:py-11">
          <div className="min-w-0 max-w-3xl">
            <h1 lang={locale === "zh-cn" ? "zh-CN" : locale} className="whitespace-pre-line hyphens-auto font-sans text-[1.65rem] font-semibold leading-[1.2] tracking-tight text-ink [overflow-wrap:anywhere] sm:text-3xl sm:leading-[1.2] md:text-[2.65rem] md:leading-[1.2]">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-steel">{copy.description}</p>
          </div>
          {heroImages.length > 0 && <div className="flex max-w-[340px] shrink-0 items-center gap-4 sm:w-[28%]" aria-hidden="true">
            {heroImages.map((image) => (
              // Preview assets use the private development route, not the public image optimizer.
              // eslint-disable-next-line @next/next/no-img-element
              <img key={image.model} src={image.src!} alt="" width={160} height={120} className="product-image h-20 min-w-0 flex-1 md:h-28" />
            ))}
          </div>}
        </Container>
      </section>

      <Container className="max-w-[1440px] py-8 md:py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)] lg:gap-10">
          <section aria-labelledby="home-products-title" className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="home-products-title" className="text-2xl font-semibold">{copy.findProduct}</h2>
              <Link className="text-link min-h-11" href={href("/products")}>{copy.allProducts}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <form action={href("/products")} method="get" role="search" className="mt-3">
              <label htmlFor="home-model-search" className="sr-only">{copy.modelLabel}</label>
              <div className="flex gap-2">
                <input id="home-model-search" name="q" type="search" maxLength={80} placeholder={copy.placeholder} autoComplete="off" className="field min-w-0 flex-1 text-base" />
                <button className={buttonVariants({ variant: "accent" })} type="submit"><Search className="h-4 w-4" aria-hidden="true" />{copy.search}</button>
              </div>
            </form>
            <div className="my-3 flex flex-wrap gap-x-6 gap-y-1">
              <Link href={engineerHref} className="text-link min-h-11" data-testid="home-calculator-link"><Calculator className="h-5 w-5" aria-hidden="true" />{copy.calculate}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href={href("/selector/buyer")} className="text-link min-h-11"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" />{copy.buyerFilter}</Link>
            </div>
            {unavailable ? <div role="status" className="border-y border-line py-6">
              <p className="text-sm leading-7 text-steel">{copy.unavailable}</p>
              <a href={href("/")} className="text-link mt-3 min-h-11">{copy.retry}</a>
            </div> : families.length === 0 ? <p className="border-y border-line py-6 text-sm leading-7 text-steel">{copy.noProducts}</p> : (
              <div className="border-t border-line" data-testid="home-family-list">
                {families.map((family) => {
                  const model = familyVisualModels[family.slug];
                  const src = model ? productImageUrl(model) : null;
                  return (
                    <article key={family.slug} className="group border-b border-line">
                      <Link href={href(`/products/${family.slug}`)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-sm py-5 hover:bg-sand sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:gap-x-5">
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt={family.name} width={100} height={80} loading="lazy" className="product-image col-start-2 row-start-1 h-16 w-20 sm:col-start-1 sm:h-20 sm:w-24" />
                        ) : <span className="hidden sm:block" aria-hidden="true" />}
                        <div lang={family.language} className="col-start-1 row-start-1 min-w-0 sm:col-start-2">
                          <h3 className="text-lg font-semibold leading-6 text-ink group-hover:text-accent">{family.name}</h3>
                          <p className="mt-2 text-base leading-7 text-steel">{family.summary}</p>
                        </div>
                        <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:max-w-[145px] sm:flex-col sm:items-start">
                          <p className="text-xs leading-5 text-steel">{copy.series}: <span className="font-medium text-ink">{family.seriesCodes.join(" · ")}</span></p>
                          <span className="inline-flex items-center gap-3 text-sm font-semibold text-accent">{copy.viewRange}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
            {locale !== "en" && locale !== "zh-cn" && <p className="mt-3 text-xs leading-6 text-steel">{copy.technicalNote}</p>}
          </section>

          <aside aria-labelledby="home-support-title" className="rounded-xl border border-line bg-sand p-6 lg:p-7">
            <h2 id="home-support-title" className="text-2xl font-semibold leading-8">{copy.supportTitle}</h2>
            <p className="mt-3 text-base leading-7 text-steel">{copy.supportDescription}</p>
            <div className="mt-5 divide-y divide-line">
              <Link href={getInquiryRequestHref(locale, "replacement")} className="flex min-h-14 items-center gap-3 py-3 text-sm font-semibold text-accent"><Wrench className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="flex-1">{copy.replacement}</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href={href("/downloads")} className="flex min-h-14 items-center gap-3 py-3 text-sm font-semibold text-accent"><BookOpen className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="flex-1">{copy.downloads}</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <Link href={getInquiryRequestHref(locale, "project")} className={cn(buttonVariants({ variant: "accent" }), "mt-5 w-full")}>{copy.project}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            <p className="mt-3 text-xs leading-6 text-steel">{copy.supportNote}</p>
            <div className="mt-5 border-t border-line pt-4">
              <a href={`mailto:${brand.email}`} className="flex min-h-11 items-center gap-3 text-sm text-accent hover:underline"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="break-all">{brand.email}</span></a>
              <a href={brand.whatsapp.href} className="flex min-h-11 items-center gap-3 text-sm text-accent hover:underline"><MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" /><span>WhatsApp: {brand.whatsapp.displayNumber}</span></a>
            </div>
          </aside>
        </div>
        {process.env.NODE_ENV !== "production" && hasPreviewImages && <p className="mt-4 text-xs leading-5 text-steel">{copy.preview}</p>}
      </Container>

      <section id="home-calculations" aria-labelledby="home-calculations-title" className="scroll-mt-24 border-y border-line bg-sand">
        <Container className="max-w-[1440px] py-10 md:py-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 id="home-calculations-title" className="flex items-center gap-3 text-2xl font-semibold"><Calculator className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />{copy.calculationTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-steel">{copy.calculationDescription}</p>
            </div>
            <Link href={engineerHref} className={cn(buttonVariants({ variant: "accent" }), "self-start md:shrink-0")}>{copy.calculate}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3" data-testid="home-motion-list">
            {motions.map((motion) => <Link key={motion.key} href={href(`/selector/engineer?entryKey=${motion.key}`)} className="group flex items-start gap-4 border-t border-line py-5">
              <div lang={locale === "zh-cn" ? "zh-CN" : "en"} className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-6 group-hover:text-accent">{motion.name}</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{motion.description}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            </Link>)}
          </div>
        </Container>
      </section>

      <section aria-labelledby="home-knowledge-title" id="home-knowledge" className="scroll-mt-24">
        <Container className="max-w-[1440px] py-10 md:py-12">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="home-knowledge-title" className="text-2xl font-semibold">{copy.knowledgeTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-steel">{copy.knowledgeDescription}</p>
            </div>
            <Link href={href("/knowledge-center")} className="text-link min-h-11">{copy.allArticles}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] lg:gap-10">
            <div className="grid gap-x-8 sm:grid-cols-2" data-testid="home-knowledge-list">
              {knowledgeCategories.map((category) => {
                const localized = knowledgeCopy.categories[category.slug] ?? category;
                return <Link key={category.slug} href={href(`/knowledge-center/${category.slug}`)} className="group flex gap-3 border-t border-line py-4">
                  <div className="flex-1"><h3 className="text-base font-semibold leading-6 group-hover:text-accent">{localized.title}</h3><p className="mt-2 text-sm leading-6 text-steel">{localized.description}</p></div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                </Link>;
              })}
            </div>
            <div className="border-t border-line pt-4">
              <h3 className="text-base font-semibold">{copy.commonQuestions}</h3>
              {questions.map((question) => <Link key={question.href} href={question.href} className="mt-3 flex min-h-11 items-start gap-3 py-2 text-sm leading-6 text-accent hover:underline"><span className="flex-1">{question.label}</span><ArrowRight className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /></Link>)}
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="home-applications-title" className="border-t border-line">
        <Container className="max-w-[1440px] py-10 md:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="home-applications-title" className="text-2xl font-semibold">{siteCopy.home.applicationSection.eyebrow}</h2>
            <Link href={href("/applications")} className="text-link min-h-11">{siteCopy.home.applicationSection.cta}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-5 grid gap-x-8 sm:grid-cols-2">
            {siteCopy.home.applicationSection.sectors.map((sector, index) => <Link key={sector.title} href={href(index < 2 ? "/products/shock-absorbers" : "/products/heavy-duty-buffers")} className="group border-t border-line py-5">
              <h3 className="flex items-center justify-between gap-4 text-base font-semibold group-hover:text-accent">{sector.title}<ArrowRight className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" /></h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-steel">{sector.description}</p>
            </Link>)}
          </div>
        </Container>
      </section>
    </div>
  );
}
