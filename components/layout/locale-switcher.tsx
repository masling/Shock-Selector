"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { locales, type Locale } from "@/lib/i18n/config";
import { replaceLocaleInPathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

type LocaleSwitcherProps = {
  locale: Locale;
  localeNames: Record<Locale, string>;
  compact?: boolean;
  className?: string;
};

function buildLocalizedTarget(pathname: string, searchParams: URLSearchParams, locale: Locale) {
  const query = searchParams.toString();
  const current = query ? `${pathname}?${query}` : pathname;
  return replaceLocaleInPathname(current, locale);
}

export function LocaleSwitcher({
  locale,
  localeNames,
  compact = false,
  className,
}: LocaleSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = localeNames[locale];
  const availableLocales = useMemo(
    () =>
      locales.map((itemLocale) => ({
        locale: itemLocale,
        label: localeNames[itemLocale],
        href: buildLocalizedTarget(pathname, searchParams, itemLocale),
      })),
    [localeNames, pathname, searchParams],
  );

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[0.95rem] text-ink shadow-sm transition hover:border-accent/25 hover:bg-white",
          compact && "w-full justify-between rounded-xl px-4 py-3 text-base",
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-steel transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close language menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute right-0 top-[calc(100%+0.4rem)] z-50 min-w-[11rem] overflow-hidden rounded-xl border border-line/80 bg-white shadow-[0_10px_30px_rgba(16,24,40,0.12)]",
              compact && "left-0 right-auto min-w-full",
            )}
            role="menu"
          >
            {availableLocales.map((item) => (
              <Link
                key={item.locale}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 text-[0.95rem] transition hover:bg-mist hover:text-ink",
                  item.locale === locale ? "bg-sand font-semibold text-ink" : "text-steel",
                )}
                role="menuitem"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
