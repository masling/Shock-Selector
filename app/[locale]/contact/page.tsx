import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ContactFormClient } from "@/components/contact/contact-form-client";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getLocalizedAlternates } from "@/lib/seo";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return {
    title: copy.metadata.contactTitle,
    alternates: getLocalizedAlternates(localeParam, "/contact"),
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.contact.eyebrow}
        title={copy.contact.title}
        description={copy.contact.description}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          {copy.contact.channels.map((channel) => (
            <ContactChannelCard key={channel.label} channel={channel} />
          ))}

          <div className="rounded-[1.75rem] border border-line bg-white/75 p-6">
            <div className="text-xs uppercase tracking-[0.16em] text-steel">
              {copy.contact.socialTitle}
            </div>
            <p className="mt-3 text-sm leading-7 text-steel">{copy.contact.socialDescription}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {copy.contact.socialChannels.map((channel) => (
                <ContactChannelCard key={channel.label} channel={channel} compact />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
          <ContactFormClient locale={locale} copy={copy.contact.form} />
        </div>
      </div>
    </Container>
  );
}

function ContactChannelCard({
  channel,
  compact = false,
}: {
  channel: { label: string; value: string; href?: string };
  compact?: boolean;
}) {
  const content = (
    <>
      <div className="text-xs uppercase tracking-[0.16em] text-steel">{channel.label}</div>
      <div className={compact ? "mt-2 text-sm font-medium leading-6" : "mt-2 text-lg font-medium"}>
        {channel.value}
      </div>
    </>
  );

  const className = compact
    ? "block rounded-2xl border border-line bg-white p-4 transition hover:border-accent/40"
    : "block rounded-[1.75rem] border border-line bg-white/75 p-6 transition hover:border-accent/40";

  if (channel.href) {
    return (
      <a className={className} href={channel.href}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
