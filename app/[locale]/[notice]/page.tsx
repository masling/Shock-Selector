import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { AnalyticsPreferences } from "@/components/layout/analytics-consent";
import { websiteNotices } from "@/lib/content/website-notices";
import { isLocale } from "@/lib/i18n/config";
import { getSiteUiCopy } from "@/lib/i18n/site-ui-copy";
import { getLocalizedAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; notice: string }> };
function getNotice(key: string) { return Object.hasOwn(websiteNotices, key) ? websiteNotices[key as keyof typeof websiteNotices] : null; }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, notice } = await params; const content = getNotice(notice);
  if (!isLocale(locale) || !content) return {};
  return { title: content.title, description: content.description, alternates: getLocalizedAlternates(locale, `/${notice}`) };
}
export default async function WebsiteNoticePage({ params }: Props) {
  const { locale, notice } = await params; const content = getNotice(notice);
  if (!isLocale(locale) || !content) notFound();
  const copy = getSiteUiCopy(locale);
  return <Container className="py-10 md:py-12"><div className="max-w-3xl">
    <div lang="en"><SectionHeading title={content.title} description={content.description} /></div>
    {locale !== "en" && <p className="mt-4 text-sm text-steel">{copy.englishContent}</p>}
    <div lang="en" className="mt-9 space-y-8">{content.sections.map(section=><section key={section.title}><h2 className="text-xl font-semibold">{section.title}</h2><p className="mt-3 text-base leading-8 text-steel">{section.text}</p></section>)}</div>
    {notice === "privacy" && <div className="mt-9"><AnalyticsPreferences locale={locale} /></div>}
  </div></Container>;
}
