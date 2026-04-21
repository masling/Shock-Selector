import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { locales, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import { cn } from "@/lib/utils/cn";

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

export async function SiteHeader({ locale, copy, localeNames, mobileLabels }: SiteHeaderProps) {
  const headerStore = await headers();
  const currentPathname = headerStore.get("x-pathname") ?? `/${locale}`;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-sand/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-sand/88">
      <Container className="py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between w-full xl:w-auto">
            <Link
              href={getLocalizedHref(locale, "/")}
              className="-ml-1 flex shrink-0 items-center text-ink xl:-ml-2"
            >
              <div className="flex h-20 items-center rounded-2xl bg-accent px-5 shadow-sm ring-1 ring-black/5">
                <Image
                  src="/brand/ekd-logo.png"
                  alt="EKD"
                  width={260}
                  height={35}
                  className="h-auto w-[228px] object-contain xl:w-[248px]"
                  priority
                />
              </div>
            </Link>

            <MobileNav
              locale={locale}
              items={copy.items}
              localeNames={localeNames}
              currentPathname={currentPathname}
              labels={mobileLabels ?? { open: "Open menu", close: "Close menu" }}
            />
          </div>

          <div className="hidden w-full flex-col gap-3 lg:flex xl:w-auto xl:flex-1">
            <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
              <nav className="flex flex-wrap items-center gap-2">
                {copy.items.map((item) => {
                  const isActive = isActiveNavigationItem(currentPathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={getLocalizedHref(locale, item.href)}
                      className={cn(
                        "whitespace-nowrap",
                        isActive
                          ? cn(buttonVariants({ variant: "accent", size: "sm" }), "shadow-sm")
                          : "rounded-full px-4 py-2 text-sm text-ink hover:bg-white hover:text-accent-dark",
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
