import { z } from "zod";
import { locales } from "@/lib/i18n/config";

export const productSearchSchema = z.object({
  locale: z.enum(locales).default("en"),
  familySlug: z.string().trim().min(1).optional(),
  seriesCode: z.string().trim().min(1).optional(),
  typeCode: z
    .enum(["ADJUSTABLE", "NON_ADJUSTABLE", "HEAVY_DUTY", "BUFFER", "ISOLATOR", "SPECIALTY"])
    .optional(),
  type: z.string().trim().min(1).optional(),
  minStrokeMm: z.coerce.number().nonnegative().optional(),
  minEnergyPerCycleNm: z.coerce.number().nonnegative().optional(),
  minEnergyPerHourNm: z.coerce.number().nonnegative().optional(),
  minImpactForceN: z.coerce.number().nonnegative().optional(),
  minThrustForceN: z.coerce.number().nonnegative().optional(),
  maxTotalLengthMm: z.coerce.number().nonnegative().optional(),
  threadSize: z.string().trim().min(1).optional(),
  sortBy: z
    .enum([
      "model",
      "typeCode",
      "strokeMm",
      "energyPerCycleNm",
      "energyPerHourNm",
      "maxImpactForceN",
      "maxThrustForceN",
      "totalLengthMm",
      "threadSize",
      "createdAt",
    ])
    .default("model"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ProductSearchInput = z.infer<typeof productSearchSchema>;

export type ProductListItem = {
  id: string;
  model: string;
  familySlug: string | null;
  familyName: string | null;
  legacyTypeLabel: string | null;
  typeCode: string | null;
  localizedTypeLabel: string;
  primaryImageUrl: string | null;
  primaryImageTitle: string | null;
  seriesCode: string | null;
  strokeMm: number | null;
  energyPerCycleNm: number | null;
  energyPerHourNm: number | null;
  maxImpactForceN: number | null;
  maxThrustForceN: number | null;
  totalLengthMm: number | null;
  threadSize: string | null;
};

export type ProductSearchResult = {
  total: number;
  page: number;
  pageSize: number;
  items: ProductListItem[];
};
