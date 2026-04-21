"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { locales, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import { cn } from "@/lib/utils/cn";

type MobileNavProps = {
  locale: Locale;
  items: SiteCopy["navigation"]["items"];
  localeNames: SiteCopy["localeNames"];
  currentPathname: string;
  labels: { open: string; close: string };
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

export function MobileNav({ locale, items, localeNames, currentPathname, labels }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full p-2 text-ink hover:bg-white/80 transition-colors"
        aria-label={labels.open}
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-sand shadow-2xl transition-transform duration-300">
            <div className="flex h-full flex-col p-6">
              {/* Close button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-steel hover:text-ink transition-colors"
                  aria-label={labels.close}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation items */}
              <nav className="mt-8 flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = isActiveNavigationItem(currentPathname, item.href);
                  const href = getLocalizedHref(locale, item.href);

                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleNavClick(href)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 text-left text-base font-medium transition-colors",
                        isActive
                          ? "bg-accent text-white"
                          : "text-ink hover:bg-mist",
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Language switcher */}
              <div className="mt-auto pt-6">
                <LocaleSwitcher locale={locale} localeNames={localeNames} compact />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
