import { headers } from "next/headers";
import { resolveLocale, type Locale } from "@/lib/i18n/config";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  return resolveLocale(headerStore.get("x-locale"));
}
