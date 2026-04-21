import { productFamilies } from "@/lib/content/site";
import { prisma } from "@/lib/prisma";
import { mapProductToListItem } from "@/lib/products/product-mappers";
import type { ProductListItem } from "@/lib/products/schemas";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedCanonicalFamilySeedTranslation } from "@/lib/products/catalog-master-data";

type NumericRange = {
  min: number | null;
  max: number | null;
};

export type ProductFamilyCatalogSummary = {
  familySlug: ProductFamilySlug;
  localizedName: string | null;
  totalModels: number;
  availableTypeCodes: string[];
  strokeRange: NumericRange;
  energyPerCycleRange: NumericRange;
  representativeProducts: ProductListItem[];
  catalogAssets: Array<{
    id: string;
    title: string | null;
    url: string | null;
  }>;
};

function buildRange(values: Array<number | null>) {
  const numericValues = values.filter((value): value is number => value !== null);

  if (numericValues.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
  };
}

function sortRepresentativeProducts(a: ProductListItem, b: ProductListItem) {
  return (
    (b.energyPerCycleNm ?? -1) - (a.energyPerCycleNm ?? -1) ||
    (b.strokeMm ?? -1) - (a.strokeMm ?? -1) ||
    a.model.localeCompare(b.model)
  );
}

async function listActiveCatalogProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      publishStatus: "PUBLISHED",
      family: {
        is: {
          isActive: true,
        },
      },
    },
    orderBy: {
      model: "asc",
    },
    include: {
      family: {
        include: {
          translations: true,
          assets: {
            include: {
              asset: true,
            },
            where: {
              role: "CATALOG",
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
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
}

export async function getProductFamilyCatalogSummaries(
  representativeLimit = 4,
  locale: Locale = "en",
): Promise<ProductFamilyCatalogSummary[]> {
  const products = await listActiveCatalogProducts();
  const bucketMap = new Map<ProductFamilySlug, ProductListItem[]>(
    productFamilies.map((family) => [family.slug, []]),
  );
  const familyAssetMap = new Map<
    ProductFamilySlug,
    Array<{ id: string; title: string | null; url: string | null }>
  >();
  const localizedNameMap = new Map<ProductFamilySlug, string | null>();

  for (const product of products) {
    const familySlug = product.family?.slug as ProductFamilySlug | undefined;

    if (!familySlug) {
      continue;
    }

    bucketMap.get(familySlug)?.push(mapProductToListItem(product, locale));

    if (!familyAssetMap.has(familySlug)) {
      familyAssetMap.set(
        familySlug,
        (product.family?.assets ?? [])
          .map((assetLink) => ({
            id: assetLink.asset.id,
            title: assetLink.asset.title,
            url: assetLink.asset.publicPath ?? assetLink.asset.remoteUrl,
          }))
          .filter((asset) => Boolean(asset.url)),
      );
    }

    if (!localizedNameMap.has(familySlug)) {
      const translation =
        product.family?.translations.find((item) => item.locale === locale) ??
        product.family?.translations.find((item) => item.locale === "en") ??
        null;

      localizedNameMap.set(
        familySlug,
        translation?.name ??
          getLocalizedCanonicalFamilySeedTranslation(locale, familySlug)?.name ??
          null,
      );
    }
  }

  return productFamilies.map((family) => {
    const matchedProducts = [...(bucketMap.get(family.slug) ?? [])].sort(sortRepresentativeProducts);

    return {
      familySlug: family.slug,
      localizedName: localizedNameMap.get(family.slug) ?? null,
      totalModels: matchedProducts.length,
      availableTypeCodes: [
        ...new Set(
          matchedProducts
            .map((product) => product.typeCode)
            .filter((value): value is string => Boolean(value)),
        ),
      ],
      strokeRange: buildRange(matchedProducts.map((product) => product.strokeMm)),
      energyPerCycleRange: buildRange(
        matchedProducts.map((product) => product.energyPerCycleNm),
      ),
      representativeProducts: matchedProducts.slice(0, representativeLimit),
      catalogAssets: familyAssetMap.get(family.slug) ?? [],
    };
  });
}

export async function getProductFamilyCatalogBySlug(
  familySlug: ProductFamilySlug,
  representativeLimit = 8,
  locale: Locale = "en",
) {
  const summaries = await getProductFamilyCatalogSummaries(representativeLimit, locale);
  return summaries.find((summary) => summary.familySlug === familySlug) ?? null;
}
