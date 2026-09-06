"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/layout/brand-mark";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { locales, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import { cn } from "@/lib/utils/cn";
import { brand } from "@/lib/brand";
import { getCatalogUiCopy } from "@/lib/i18n/catalog-ui-copy";
import { buttonVariants } from "@/components/ui/button";

type SiteHeaderProps = {
  locale: Locale;
  copy: SiteCopy["navigation"];
  localeNames: SiteCopy["localeNames"];
  mobileLabels?: { open: string; close: string };
};

function normalizePathname(pathname: string) {
  const withoutQuery = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  const segments = withoutQuery.split("/").filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments.shift();
  }

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function isActiveNavigationItem(currentPathname: string, itemHref: string) {
  const currentPath = normalizePathname(currentPathname);
  const targetPath = itemHref === "/" ? "/" : itemHref.replace(/\/+$/, "") || "/";

  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function SiteHeader({ locale, copy, localeNames, mobileLabels }: SiteHeaderProps) {
  const currentPathname = usePathname() ?? `/${locale}`;
  const quoteLabel = getCatalogUiCopy(locale).quote;
  const order = ["/products", "/applications", "/selector/engineer", "/knowledge-center", "/downloads", "/about", "/contact"];
  const items = [...copy.items].sort((a, b) => order.indexOf(a.href) - order.indexOf(b.href)).map((item) =>
    item.href === "/contact" ? { ...item, label: quoteLabel } : item,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <Container className="max-w-[1440px] py-3">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between w-full xl:w-auto">
            <Link
              href={getLocalizedHref(locale, "/")}
              className="flex min-h-11 shrink-0 items-center"
              aria-label={brand.name}
            >
              <BrandMark priority className="h-10 sm:h-11" />
            </Link>

            <MobileNav
              locale={locale}
              items={items}
              localeNames={localeNames}
              currentPathname={currentPathname}
              labels={mobileLabels ?? { open: "Open menu", close: "Close menu" }}
            />
          </div>

          <div className="hidden w-full flex-col gap-3 lg:flex xl:w-auto xl:flex-1">
            <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
              <nav className="flex flex-wrap items-center gap-1">
                {items.map((item) => {
                  const isActive = isActiveNavigationItem(currentPathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={getLocalizedHref(locale, item.href)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "whitespace-nowrap",
                        item.href === "/contact" ? cn(buttonVariants({ variant: "accent", size: "sm" }), "text-sm") : isActive
                          ? "inline-flex min-h-11 items-center rounded-md bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-dark"
                          : "inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm text-ink hover:bg-mist hover:text-accent-dark",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <LocaleSwitcher locale={locale} localeNames={localeNames} />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
