"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { brand } from "@/lib/brand";
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
  const segments = pathname.split(/[?#]/)[0].split("/").filter(Boolean);
  if (locales.includes(segments[0] as Locale)) segments.shift();
  return "/" + segments.join("/");
}

export function MobileNav({ locale, items, localeNames, currentPathname, labels }: MobileNavProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = normalizePathname(currentPathname);

  useEffect(() => {
    dialog.current?.close();
  }, [currentPathname, locale]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-mist"
        aria-label={labels.open}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={isOpen}
        onClick={() => {
          if (dialog.current && !dialog.current.open) {
            dialog.current.showModal();
            setIsOpen(true);
          }
        }}
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <dialog
        ref={dialog}
        id={dialogId}
        className="mobile-dialog"
        aria-label={labels.open}
        onClose={() => setIsOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
          )).filter((element) => element.getClientRects().length > 0);
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right ||
              event.clientY < bounds.top || event.clientY > bounds.bottom) {
            event.currentTarget.close();
          }
        }}
      >
        <div className="flex min-h-full flex-col p-6">
          <div className="flex items-center justify-between gap-4">
            <BrandMark className="h-10" />
            <button
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-mist"
              aria-label={labels.close}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <nav className="my-8 flex flex-col gap-2">
            {items.map((item) => {
              const target = item.href.replace(/\/+$/, "") || "/";
              const active = currentPath === target || (target !== "/" && currentPath.startsWith(target + "/"));
              return (
                <Link
                  key={item.href}
                  href={getLocalizedHref(locale, item.href)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => dialog.current?.close()}
                  className={cn(
                    "flex min-h-12 items-center rounded-md px-4 py-3 text-base",
                    item.href === "/contact" ? "bg-accent font-semibold text-white hover:bg-accent-dark" : active ? "bg-accent-soft font-semibold text-accent-dark" : "text-ink hover:bg-mist",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-line pt-6">
            <LocaleSwitcher locale={locale} localeNames={localeNames} compact />
          </div>
        </div>
      </dialog>
    </div>
  );
}
