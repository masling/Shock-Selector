import type { Prisma } from "@prisma/client";

export function publishedFamilyWhere(slug?: string): Prisma.ProductFamilyWhereInput {
  return { isActive: true, catalogStatus: "PUBLISHED", ...(slug ? { slug } : {}) };
}

export function publishedSeriesWhere(input: { familySlug?: string; seriesSlug?: string; seriesCode?: string } = {}): Prisma.ProductSeriesWhereInput {
  return {
    catalogStatus: "PUBLISHED",
    family: publishedFamilyWhere(input.familySlug),
    ...(input.seriesSlug ? { slug: input.seriesSlug } : {}),
    ...(input.seriesCode ? { code: input.seriesCode.toUpperCase() } : {}),
  };
}

export function publishedModelWhere(input: { familySlug?: string; seriesSlug?: string; seriesCode?: string } = {}): Prisma.ProductModelWhereInput {
  return { isActive: true, catalogStatus: "PUBLISHED", series: publishedSeriesWhere(input) };
}
