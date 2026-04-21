import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductSearchInput } from "@/lib/products/schemas";
import { resolveProductTypeCode } from "@/lib/products/catalog-master-data";

function buildWhere(input: ProductSearchInput): Prisma.ProductWhereInput {
  const normalizedSeriesCode = input.seriesCode?.trim().toUpperCase();
  const normalizedTypeCode =
    input.typeCode ?? (input.type ? resolveProductTypeCode(input.type, input.type) : undefined);

  return {
    isActive: true,
    publishStatus: "PUBLISHED",
    ...(input.familySlug ? { family: { is: { slug: input.familySlug } } } : {}),
    ...(normalizedSeriesCode ? { seriesCode: normalizedSeriesCode } : {}),
    ...(normalizedTypeCode ? { typeCode: normalizedTypeCode } : {}),
    ...(input.type
      ? {
          OR: [
            { legacyTypeLabel: { contains: input.type, mode: "insensitive" } },
            { type: { contains: input.type, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(input.threadSize
      ? {
          threadSize: {
            contains: input.threadSize,
            mode: "insensitive",
          },
        }
      : {}),
    ...(input.minStrokeMm !== undefined ? { strokeMm: { gte: input.minStrokeMm } } : {}),
    ...(input.minEnergyPerCycleNm !== undefined
      ? { energyPerCycleNm: { gte: input.minEnergyPerCycleNm } }
      : {}),
    ...(input.minEnergyPerHourNm !== undefined
      ? { energyPerHourNm: { gte: input.minEnergyPerHourNm } }
      : {}),
    ...(input.minImpactForceN !== undefined
      ? { maxImpactForceN: { gte: input.minImpactForceN } }
      : {}),
    ...(input.minThrustForceN !== undefined
      ? { maxThrustForceN: { gte: input.minThrustForceN } }
      : {}),
    ...(input.maxTotalLengthMm !== undefined
      ? { totalLengthMm: { lte: input.maxTotalLengthMm } }
      : {}),
  };
}

function buildOrderBy(input: ProductSearchInput): Prisma.ProductOrderByWithRelationInput {
  if (input.sortBy === "typeCode") {
    return {
      typeCode: input.sortDirection,
    };
  }

  return {
    [input.sortBy]: input.sortDirection,
  };
}

export async function searchProducts(input: ProductSearchInput) {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildOrderBy(input),
      skip,
      take: input.pageSize,
      include: {
        family: {
          include: {
            translations: true,
          },
        },
        translations: true,
        assets: {
          where: {
            role: "PRIMARY_IMAGE",
          },
          include: {
            asset: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}
