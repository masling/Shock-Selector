import type { MetadataRoute } from "next";

const staticPaths = [
  "",
  "/products",
  "/selector/engineer",
  "/selector/buyer",
];

function getPriority(path: string) {
  if (path === "") return 1;
  if (path === "/products" || path === "/selector/engineer") return 0.9;
  if (path.startsWith("/products/")) return 0.8;
  return 0.7;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibroabsorber.com";
  const lastModified = new Date();

  return staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: path.startsWith("/products") ? "weekly" as const : "monthly" as const,
    priority: getPriority(path),
  }));
}
