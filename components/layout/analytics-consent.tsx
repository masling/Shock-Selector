"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { getSiteUiCopy } from "@/lib/i18n/site-ui-copy";

const storageKey = "ekd-analytics-consent-v1";
const analyticsId = "G-YVJYV2FPW3";
function allowed() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    return value?.allowed === true && Date.now() - value.updatedAt < 180 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export function AnalyticsLoader() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => { setEnabled(process.env.NODE_ENV === "production" && allowed()); }, []);
  if (!enabled) return null;
  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analyticsId}');`}</Script>
  </>;
}

export function AnalyticsPreferences({ locale }: { locale: Locale }) {
  const copy = getSiteUiCopy(locale);
  const [current, setCurrent] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => setCurrent(allowed()), []);
  function save(value: boolean) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ allowed: value, updatedAt: Date.now() }));
      if (!value) {
        const names = document.cookie.split(";").map(c=>c.split("=")[0].trim()).filter(n=>n === "_ga" || n.startsWith("_ga_"));
        const parts = location.hostname.split(".");
        for (const name of names) {
          document.cookie = `${name}=; Max-Age=0; Path=/`;
          for (let i=0; i<parts.length-1; i++) document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${parts.slice(i).join(".")}`;
        }
      }
      location.reload();
    } catch { setError(true); }
  }
  return <section id="analytics" className="scroll-mt-28 rounded-xl border border-line bg-sand p-6">
    <h2 className="text-xl font-semibold">{copy.cookieSettings}</h2><p className="mt-3 text-sm leading-7">{copy.analyticsText}</p>
    <div className="mt-4 flex flex-wrap gap-3"><Button type="button" variant={current ? "accent" : "secondary"} onClick={()=>save(true)} aria-pressed={current}>{copy.allow}</Button><Button type="button" variant={current ? "secondary" : "accent"} onClick={()=>save(false)} aria-pressed={!current}>{copy.reject}</Button></div>
    {error && <p role="alert" className="mt-3 text-sm text-red-800">{locale === "zh-cn" ? "浏览器无法保存此设置，请检查存储权限。" : "Your browser could not save this preference. Check its storage permissions."}</p>}
  </section>;
}
