import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { ContactFormClient } from "@/components/contact/contact-form-client";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { brand } from "@/lib/brand";
import { isLocale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getSiteUiCopy } from "@/lib/i18n/site-ui-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getLocalizedAlternates } from "@/lib/seo";
import { getInquiryInitialMessage, type InquirySearchParams } from "@/lib/contact/inquiry-context";

type ContactPageProps = { params: Promise<{ locale: string }>; searchParams?: Promise<InquirySearchParams> };

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getSiteCopy(locale);
  return { title: copy.metadata.contactTitle, description: copy.contact.description, alternates: getLocalizedAlternates(locale, "/contact") };
}

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = searchParams ? await searchParams : {};
  const copy = getSiteCopy(locale);
  const ui = getSiteUiCopy(locale);
  const initialMessage = getInquiryInitialMessage(query, locale);
  return (
    <Container className="py-10 md:py-12">
      <SectionHeading title={copy.contact.eyebrow} description={ui.contactIntro} />
      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(250px,0.6fr)_minmax(0,1fr)] lg:gap-14">
        <aside className="border-t border-line pt-6">
          <p className="text-xl font-semibold">{brand.name} <span lang="zh-CN">{brand.company}</span></p>
          <div className="mt-5 divide-y divide-line">
            <a href={`mailto:${brand.email}`} className="flex items-center gap-4 py-5 text-accent hover:underline">
              <Mail className="h-5 w-5 shrink-0" aria-hidden="true" /><span className="break-all">{brand.email}</span>
            </a>
            <a href={brand.whatsapp.href} className="flex items-center gap-4 py-5 text-accent hover:underline">
              <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" /><span>WhatsApp<br />{brand.whatsapp.displayNumber}</span>
            </a>
          </div>
          <p className="mt-6 text-sm leading-7 text-steel">{copy.contact.description}</p>
          <Link href={getLocalizedHref(locale, "/inquiry")} className="text-link mt-5 min-h-11">{ui.inquiries}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </aside>
        <section className="min-w-0 rounded-xl border border-line bg-white p-5 sm:p-8">
          <h2 className="mb-6 text-2xl font-semibold">{ui.emailDraft}</h2>
          <ContactFormClient key={`${locale}:${initialMessage}`} locale={locale} copy={copy.contact.form} initialMessage={initialMessage} deliveryAvailable={Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL_TO)} />
          <p className="mt-5 text-xs leading-6 text-steel">{ui.dataNotice} <Link href={getLocalizedHref(locale, "/privacy")} className="underline underline-offset-4">{ui.privacy}</Link></p>
        </section>
      </div>
    </Container>
  );
}
