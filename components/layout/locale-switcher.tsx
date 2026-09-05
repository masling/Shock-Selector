"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { replaceLocaleInPathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

type LocaleSwitcherProps = {
  locale: Locale;
  localeNames: Record<Locale, string>;
  compact?: boolean;
  className?: string;
};

const languageLabels: Record<Locale, string> = {
  en: "Language", "zh-cn": "语言", de: "Sprache", fr: "Langue", it: "Lingua",
};

export function LocaleSwitcher({ locale, localeNames, compact = false, className }: LocaleSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <select
      aria-label={languageLabels[locale]}
      value={locale}
      onChange={(event) => {
        const query = searchParams.toString();
        const target = pathname + (query ? "?" + query : "") + window.location.hash;
        router.push(replaceLocaleInPathname(target, event.target.value as Locale));
      }}
      className={cn(
        "min-h-11 max-w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink",
        compact && "w-full text-base",
        className,
      )}
    >
      {locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
    </select>
  );
}
