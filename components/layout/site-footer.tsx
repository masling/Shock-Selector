import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import { brand } from "@/lib/brand";
import { getSiteUiCopy } from "@/lib/i18n/site-ui-copy";

type SiteFooterProps = {
  locale: Locale;
  copy: SiteCopy["footer"];
};

export function SiteFooter({ locale, copy }: SiteFooterProps) {
  const ui = getSiteUiCopy(locale);
  return (
    <footer className="mt-14 border-t border-line bg-sand">
      <Container className="grid max-w-[1440px] gap-10 py-14 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <div className="space-y-4">
          <Link href={getLocalizedHref(locale, "/")} className="inline-flex min-h-11 items-center">
            <Image src={brand.logo} alt={`${brand.name} ${brand.company}`} width={1158} height={217} className="h-auto w-[214px]" />
          </Link>
          <p className="max-w-md text-sm leading-7 text-steel">{copy.summary}</p>
          <a href={`mailto:${brand.email}`} className="block text-sm text-accent hover:underline">{brand.email}</a>
          <a href={brand.whatsapp.href} className="block text-sm text-accent hover:underline">WhatsApp · {brand.whatsapp.displayNumber}</a>
        </div>

        {copy.groups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-base font-semibold text-ink">
              {group.title}
            </h3>
            <ul className="space-y-3 text-sm text-steel">
              {group.links.filter((link, index, links) => links.findIndex(item=>item.href === link.href) === index).map((link) => (
                <li key={`${group.title}-${link.href}-${link.label}`}>
                  <Link href={getLocalizedHref(locale, link.href)} className="hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col justify-between gap-3 py-5 text-xs leading-6 text-steel md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} <span lang="zh-CN">{brand.company}</span> · {brand.name}. {ui.copyright}</p>
          <nav aria-label={ui.terms} className="flex flex-wrap gap-x-5 gap-y-1">
            <Link className="inline-flex min-h-11 items-center hover:text-accent" href={getLocalizedHref(locale, "/privacy")}>{ui.privacy}</Link>
            <Link className="inline-flex min-h-11 items-center hover:text-accent" href={getLocalizedHref(locale, "/terms")}>{ui.terms}</Link>
            <Link className="inline-flex min-h-11 items-center hover:text-accent" href={getLocalizedHref(locale, "/selection-guidance")}>{ui.selection}</Link>
            <Link className="inline-flex min-h-11 items-center hover:text-accent" href={getLocalizedHref(locale, "/privacy#analytics")}>{ui.cookieSettings}</Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
