import { z } from "zod";

export const catalogModelSearchSchema = z.object({
  locale: z.string().default("en"),
  familySlug: z.string().trim().min(1).optional(),
  seriesSlug: z.string().trim().min(1).optional(),
  seriesCode: z.string().trim().min(1).optional(),
  modelQuery: z.string().trim().min(1).optional(),
  selectorOnly: z.coerce.boolean().default(false),
  includeIncomplete: z.coerce.boolean().default(true),
  minStrokeMm: z.coerce.number().nonnegative().optional(),
  minEnergyPerCycleNm: z.coerce.number().nonnegative().optional(),
  minEnergyPerHourNm: z.coerce.number().nonnegative().optional(),
  minImpactForceN: z.coerce.number().nonnegative().optional(),
  minThrustForceN: z.coerce.number().nonnegative().optional(),
  maxTotalLengthMm: z.coerce.number().nonnegative().optional(),
  threadSize: z.string().trim().min(1).optional(),
  sortBy: z.enum(["model", "series", "selectorStatus", "createdAt"]).default("model"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CatalogModelSearchInput = z.infer<typeof catalogModelSearchSchema>;

export type CatalogSpecListItem = {
  key: string;
  label: string;
  unit: string | null;
  value: number | string | null;
  rawValue: string | null;
};

export type CatalogModelListItem = {
  id: string;
  model: string;
  familySlug: string;
  familyName: string;
  seriesSlug: string;
  seriesCode: string;
  seriesName: string;
  selectorEligible: boolean;
  selectorStatus: string;
  catalogStatus: string;
  primaryImageUrl: string | null;
  specs: CatalogSpecListItem[];
};

export type CatalogModelSearchResult = {
  total: number;
  page: number;
  pageSize: number;
  items: CatalogModelListItem[];
};
