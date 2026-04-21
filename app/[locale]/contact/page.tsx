import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ContactFormClient } from "@/components/contact/contact-form-client";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return { title: copy.metadata.contactTitle };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);
  const contactValues = [
    "office@ekdchina.com",
    "tech@ekdchina.com",
    "sales1@ekdchina.com",
    "service@ekdchina.com",
  ];

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        description={copy.contact.description}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          {copy.contact.contactLabels.map((label, index) => (
            <div key={label} className="rounded-[1.75rem] border border-line bg-white/75 p-6">
              <div className="text-xs uppercase tracking-[0.16em] text-steel">{label}</div>
              <div className="mt-2 text-lg font-medium">{contactValues[index]}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
          <ContactFormClient locale={locale} copy={copy.contact.form} />
        </div>
      </div>
    </Container>
  );
}
