import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import type { SiteCopy } from "@/lib/i18n/site-copy";

type SiteFooterProps = {
  locale: Locale;
  copy: SiteCopy["footer"];
};

export function SiteFooter({ locale, copy }: SiteFooterProps) {
  return (
    <footer className="mt-24 border-t border-line bg-[#e9ede4]">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <div className="space-y-4">
          <p className="font-display text-2xl font-semibold">EKD</p>
          <p className="max-w-md text-sm leading-7 text-steel">{copy.summary}</p>
        </div>

        {copy.groups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">
              {group.title}
            </h3>
            <ul className="space-y-3 text-sm text-steel">
              {group.links.map((link) => (
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
    </footer>
  );
}
