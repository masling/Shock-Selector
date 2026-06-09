import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CatalogModelSearchInput } from "@/lib/catalog/catalog-schemas";

const absorberSpecFilterKeys = {
  minStrokeMm: "strokeMm",
  minEnergyPerCycleNm: "energyPerCycleNm",
  minEnergyPerHourNm: "energyPerHourNm",
  minImpactForceN: "maxImpactForceN",
  minThrustForceN: "maxThrustForceN",
  maxTotalLengthMm: "totalLengthMm",
} as const;

function numericSpecFilter(key: string, value: number, mode: "gte" | "lte"): Prisma.ProductModelWhereInput {
  return {
    specValues: {
      some: {
        specDefinition: { key },
        valueNumber: { [mode]: value },
      },
    },
  };
}

function buildWhere(input: CatalogModelSearchInput): Prisma.ProductModelWhereInput {
  const filters: Prisma.ProductModelWhereInput[] = [];

  for (const [inputKey, specKey] of Object.entries(absorberSpecFilterKeys)) {
    const value = input[inputKey as keyof CatalogModelSearchInput];
    if (typeof value === "number") {
      filters.push(numericSpecFilter(specKey, value, inputKey === "maxTotalLengthMm" ? "lte" : "gte"));
    }
  }

  if (input.threadSize) {
    filters.push({
      specValues: {
        some: {
          specDefinition: { key: "threadSize" },
          valueText: { contains: input.threadSize, mode: "insensitive" },
        },
      },
    });
  }

  return {
    isActive: true,
    catalogStatus: { in: ["PUBLISHED", "NEEDS_REVIEW"] },
    ...(input.selectorOnly ? { selectorEligible: true, selectorStatus: input.includeIncomplete ? { in: ["READY", "INCOMPLETE"] } : "READY" } : {}),
    ...(input.familySlug ? { series: { family: { slug: input.familySlug } } } : {}),
    ...(input.seriesSlug ? { series: { slug: input.seriesSlug } } : {}),
    ...(input.seriesCode ? { series: { code: input.seriesCode.toUpperCase() } } : {}),
    ...(input.modelQuery ? { model: { contains: input.modelQuery, mode: "insensitive" } } : {}),
    ...(filters.length ? { AND: filters } : {}),
  };
}

function buildOrderBy(input: CatalogModelSearchInput): Prisma.ProductModelOrderByWithRelationInput {
  if (input.sortBy === "series") {
    return { series: { code: input.sortDirection } };
  }

  if (input.sortBy === "selectorStatus") {
    return { selectorStatus: input.sortDirection };
  }

  if (input.sortBy === "createdAt") {
    return { createdAt: input.sortDirection };
  }

  return { sortKey: input.sortDirection };
}

export async function findCatalogFamilies(locale: string) {
  return prisma.productFamily.findMany({
    where: { isActive: true, catalogStatus: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale } },
      series: { where: { catalogStatus: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function findCatalogFamilyBySlug(slug: string, locale: string) {
  return prisma.productFamily.findUnique({
    where: { slug },
    include: {
      translations: true,
      series: { where: { catalogStatus: { in: ["PUBLISHED", "NEEDS_REVIEW"] } }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function findCatalogSeriesBySlug(familySlug: string, seriesSlug: string) {
  return prisma.productSeries.findFirst({
    where: { slug: seriesSlug, family: { slug: familySlug } },
    include: {
      family: { include: { translations: true } },
      sourceReferences: true,
      specDefinitions: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function searchCatalogModels(input: CatalogModelSearchInput) {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [items, total] = await Promise.all([
    prisma.productModel.findMany({
      where,
      orderBy: buildOrderBy(input),
      skip,
      take: input.pageSize,
      include: {
        series: { include: { family: { include: { translations: true } } } },
        specValues: {
          include: { specDefinition: true },
          orderBy: { specDefinition: { sortOrder: "asc" } },
        },
      },
    }),
    prisma.productModel.count({ where }),
  ]);

  return { items, total };
}

export async function listCatalogThreadSizes() {
  const values = await prisma.productSpecValue.findMany({
    where: { specDefinition: { key: "threadSize" }, valueText: { not: null } },
    select: { valueText: true },
    distinct: ["valueText"],
    orderBy: { valueText: "asc" },
  });

  return values.map((item) => item.valueText).filter((value): value is string => Boolean(value));
}
