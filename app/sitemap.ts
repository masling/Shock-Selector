import type { MetadataRoute } from "next";
import { findCatalogFamilies } from "@/lib/catalog/catalog-repository";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";
import { knowledgeArticles, getKnowledgeArticlePath } from "@/lib/knowledge-center/content";
import { getAbsoluteUrl, getLocalizedPath, staticSeoPaths, type SeoPath } from "@/lib/seo";

export const dynamic = "force-dynamic";

function getPriority(path: string) {
  if (path === "") return 1;
  if (path === "/products" || path === "/selector/engineer") return 0.9;
  if (path.startsWith("/products/")) return 0.8;
  return 0.7;
}

function sitemapEntry(locale: Locale, path: SeoPath, lastModified: Date): MetadataRoute.Sitemap[number] {
  const localizedPath = getLocalizedPath(locale, path);

  return {
    url: getAbsoluteUrl(localizedPath),
    lastModified,
    changeFrequency: path.startsWith("/products") ? "weekly" : "monthly",
    priority: getPriority(path),
    alternates: {
      languages: Object.fromEntries(
        locales.map((alternateLocale) => [alternateLocale, getAbsoluteUrl(getLocalizedPath(alternateLocale, path))]),
      ),
    },
  };
}

async function getProductPaths() {
  try {
    const families = await findCatalogFamilies(defaultLocale);
    return families.flatMap((family) => [
      `/products/${family.slug}` as SeoPath,
      ...family.series.map((series) => `/products/${family.slug}/${series.slug}` as SeoPath),
    ]);
  } catch (error) {
    console.error("Sitemap product paths fallback activated because the database is unavailable.", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const knowledgePaths = knowledgeArticles.map((article) => getKnowledgeArticlePath(article) as SeoPath);
  const paths = [...staticSeoPaths, ...knowledgePaths, ...(await getProductPaths())];

  return locales.flatMap((locale) => paths.map((path) => sitemapEntry(locale, path, lastModified)));
}
