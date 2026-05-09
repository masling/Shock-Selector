import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { productFamilies, featuredModels } from "@/lib/content/site";
import {
  getAbsoluteUrl,
  getLanguageAlternates,
  getLocalizedPath,
  staticSeoPaths,
  type SeoPath,
} from "@/lib/seo";

const productFamilyPaths = productFamilies.map(
  (family) => `/products/${family.slug}` as const,
);

const featuredProductPaths = featuredModels.map(
  (model) => `/products/${model.familySlug}/${model.id}` as const,
);

const sitemapPaths: SeoPath[] = [
  ...staticSeoPaths,
  ...productFamilyPaths,
  ...featuredProductPaths,
];

function getPriority(path: SeoPath) {
  if (path === "") {
    return 1;
  }

  if (path === "/products" || path === "/selector/engineer") {
    return 0.9;
  }

  if (path.startsWith("/products/")) {
    return 0.8;
  }

  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return sitemapPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: getAbsoluteUrl(getLocalizedPath(locale, path)),
      lastModified,
      changeFrequency: path.startsWith("/products") ? "weekly" : "monthly",
      priority: getPriority(path),
      alternates: {
        languages: getLanguageAlternates(path),
      },
    })),
  );
}
