import type {
  Asset,
  Product,
  ProductAsset,
  ProductFamily,
  ProductFamilyTranslation,
  ProductTranslation,
} from "@prisma/client";
import type { Locale } from "@/lib/i18n/config";
import {
  getLocalizedCanonicalFamilySeedTranslation,
  getLocalizedTypeCodeLabel,
} from "@/lib/products/catalog-master-data";
import type { ProductListItem } from "@/lib/products/schemas";

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

type ProductWithPresentationRelations = Product & {
  family?: (ProductFamily & {
    translations?: ProductFamilyTranslation[];
  }) | null;
  translations?: ProductTranslation[];
  assets?: Array<
    ProductAsset & {
      asset: Asset;
    }
  >;
};

function getPreferredAssetUrl(asset: Asset | null | undefined) {
  return asset?.publicPath ?? asset?.remoteUrl ?? null;
}

function getLocalizedFamilyName(
  locale: Locale,
  family: (ProductFamily & { translations?: ProductFamilyTranslation[] }) | null | undefined,
) {
  if (!family) {
    return null;
  }

  const directMatch = family.translations?.find((translation) => translation.locale === locale);
  if (directMatch) {
    return directMatch.name;
  }

  const englishMatch = family.translations?.find((translation) => translation.locale === "en");
  if (englishMatch) {
    return englishMatch.name;
  }

  return getLocalizedCanonicalFamilySeedTranslation(locale, family.slug)?.name ?? family.slug;
}

function getLocalizedProductDisplayName(
  locale: Locale,
  product: ProductWithPresentationRelations,
) {
  const directMatch = product.translations?.find((translation) => translation.locale === locale);
  if (directMatch?.displayName) {
    return directMatch.displayName;
  }

  const englishMatch = product.translations?.find((translation) => translation.locale === "en");
  if (englishMatch?.displayName) {
    return englishMatch.displayName;
  }

  return product.model;
}

export function mapProductToListItem(
  product: ProductWithPresentationRelations,
  locale: Locale = "en",
): ProductListItem {
  const primaryImageAsset = product.assets?.[0]?.asset;

  return {
    id: product.id,
    model: getLocalizedProductDisplayName(locale, product),
    familySlug: product.family?.slug ?? null,
    familyName: getLocalizedFamilyName(locale, product.family),
    legacyTypeLabel: product.legacyTypeLabel ?? product.type,
    typeCode: product.typeCode ?? null,
    localizedTypeLabel: getLocalizedTypeCodeLabel(
      locale,
      product.typeCode,
      product.legacyTypeLabel ?? product.type,
    ),
    primaryImageUrl: getPreferredAssetUrl(primaryImageAsset),
    primaryImageTitle: primaryImageAsset?.title ?? null,
    seriesCode: product.seriesCode,
    strokeMm: toNumber(product.strokeMm),
    energyPerCycleNm: toNumber(product.energyPerCycleNm),
    energyPerHourNm: toNumber(product.energyPerHourNm),
    maxImpactForceN: toNumber(product.maxImpactForceN),
    maxThrustForceN: toNumber(product.maxThrustForceN),
    totalLengthMm: toNumber(product.totalLengthMm),
    threadSize: product.threadSize,
  };
}
