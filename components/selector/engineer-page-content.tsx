import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { EngineerSizingClient } from "@/components/selector/engineer-sizing-client";
import { Container } from "@/components/ui/container";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getSiteUiCopy } from "@/lib/i18n/site-ui-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";

export function EngineerSizingPageContent({ locale = defaultLocale }: { locale?: Locale }) {
  const copy = getSiteCopy(locale);
  const ui = getSiteUiCopy(locale);
  return (
    <Container className="py-10 md:py-12">
      <SectionHeading title={copy.engineer.eyebrow} description={copy.engineer.description} />
      <Link href={getLocalizedHref(locale, "/selection-guidance")} className="text-link mt-4 min-h-11">{ui.selection}</Link>
      <div className="mt-6"><EngineerSizingClient locale={locale} copy={copy.engineer} /></div>
      <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
        <section><h2 className="text-xl font-semibold">{copy.engineer.howItWorksTitle}</h2><p className="mt-3 text-sm leading-7 text-steel">{copy.engineer.howItWorksDescription}</p></section>
        <section><h2 className="text-xl font-semibold">{copy.engineer.whatYouGetTitle}</h2><p className="mt-3 text-sm leading-7 text-steel">{copy.engineer.whatYouGetDescription}</p></section>
      </div>
    </Container>
  );
}
