import type { ProductTypeCode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapProductToListItem } from "@/lib/products/product-mappers";
import type { Locale } from "@/lib/i18n/config";
import {
  getLocalizedCanonicalFamilySeedTranslation,
  getLocalizedTypeCodeLabel,
} from "@/lib/products/catalog-master-data";

export async function getProductCount() {
  return prisma.product.count({
    where: {
      isActive: true,
      publishStatus: "PUBLISHED",
    },
  });
}

export async function getFeaturedProducts(limit = 6, locale: Locale = "en") {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      publishStatus: "PUBLISHED",
    },
    orderBy: [
      { energyPerCycleNm: "desc" },
      { strokeMm: "desc" },
    ],
    take: limit,
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
  });

  return products.map((product) => mapProductToListItem(product, locale));
}

export async function getProductById(id: string, locale: Locale = "en") {
  const product = await prisma.product.findUnique({
    where: { id },
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
  });

  return product ? mapProductToListItem(product, locale) : null;
}

export async function getProductTypes() {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      publishStatus: "PUBLISHED",
      typeCode: {
        not: null,
      },
    },
    select: {
      typeCode: true,
    },
    distinct: ["typeCode"],
    orderBy: {
      typeCode: "asc",
    },
  });

  return rows
    .map((row) => row.typeCode)
    .filter((value): value is ProductTypeCode => value !== null);
}

function normalizeThreadSize(value: string) {
  return value.trim().replace(/X/g, "x");
}

export async function getProductThreadSizes() {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      publishStatus: "PUBLISHED",
      threadSize: {
        not: null,
      },
    },
    select: {
      threadSize: true,
    },
    distinct: ["threadSize"],
    orderBy: {
      threadSize: "asc",
    },
  });

  return [...new Set(rows.map((row) => row.threadSize).filter((value): value is string => Boolean(value)).map(normalizeThreadSize))];
}

export async function getProductTypeSummary() {
  return prisma.product.groupBy({
    by: ["typeCode"],
    where: {
      isActive: true,
      publishStatus: "PUBLISHED",
      typeCode: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        typeCode: "desc",
      },
    },
  });
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (typeof value === "object" && value && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return null;
}

function getPreferredAssetUrl(asset: { publicPath: string | null; remoteUrl: string | null } | null | undefined) {
  return asset?.publicPath ?? asset?.remoteUrl ?? null;
}

export async function getProductDetailById(id: string, locale: Locale = "en") {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      family: {
        include: {
          translations: true,
          assets: {
            include: {
              asset: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
      translations: true,
      assets: {
        include: {
          asset: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const familyTranslation =
    product.family?.translations.find((translation) => translation.locale === locale) ??
    product.family?.translations.find((translation) => translation.locale === "en") ??
    null;

  const primaryImage = product.assets.find((assetLink) => assetLink.role === "PRIMARY_IMAGE")?.asset ?? null;
  const familyCatalogs = (product.family?.assets ?? [])
    .filter((assetLink) => assetLink.role === "CATALOG")
    .map((assetLink) => ({
      id: assetLink.asset.id,
      title: assetLink.asset.title,
      url: getPreferredAssetUrl(assetLink.asset),
    }))
    .filter((asset) => Boolean(asset.url));

  return {
    id: product.id,
    model: product.model,
    familySlug: product.family?.slug ?? null,
    familyName:
      familyTranslation?.name ??
      (product.family ? getLocalizedCanonicalFamilySeedTranslation(locale, product.family.slug)?.name ?? null : null),
    seriesCode: product.seriesCode,
    typeCode: product.typeCode,
    typeLabel: getLocalizedTypeCodeLabel(locale, product.typeCode, product.legacyTypeLabel ?? product.type),
    strokeMm: toNumber(product.strokeMm),
    energyPerCycleNm: toNumber(product.energyPerCycleNm),
    energyPerHourNm: toNumber(product.energyPerHourNm),
    maxImpactForceN: toNumber(product.maxImpactForceN),
    maxThrustForceN: toNumber(product.maxThrustForceN),
    totalLengthMm: toNumber(product.totalLengthMm),
    threadSize: product.threadSize,
    primaryImageUrl: getPreferredAssetUrl(primaryImage),
    primaryImageTitle: primaryImage?.title ?? null,
    familyCatalogs,
  };
}
