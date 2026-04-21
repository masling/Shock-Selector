import type { ProductSearchInput, ProductSearchResult } from "@/lib/products/schemas";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";
import type { ScenarioFamilyKey } from "@/lib/scenarios/schemas";

export type ProductSearchFilter = Partial<
  Pick<
    ProductSearchInput,
    | "type"
    | "minStrokeMm"
    | "minEnergyPerCycleNm"
    | "minEnergyPerHourNm"
    | "minImpactForceN"
    | "minThrustForceN"
    | "maxTotalLengthMm"
    | "threadSize"
    | "sortBy"
    | "sortDirection"
    | "page"
    | "pageSize"
  >
>;

export type CalculationDetailMetric = {
  key: string;
  value: number;
  unit: string;
};

export type CalculatorResult = {
  requiredStrokeMm: number;
  absorbedEnergyPerCycleNm: number;
  requiredEnergyPerCycleNm: number;
  requiredEnergyPerHourNm: number;
  averageImpactForceN: number;
  recommendedFamilySlug: ProductFamilySlug | null;
  assumptions: string[];
  detailMetrics?: CalculationDetailMetric[];
};

export type ScenarioCalculator<I, O extends CalculatorResult = CalculatorResult> = {
  key: string;
  familyKey: ScenarioFamilyKey;
  validateInput: (input: unknown) => I;
  calculate: (input: I) => O;
  buildFilter: (result: O) => ProductSearchFilter;
  explain?: (input: I, result: O) => string[];
};

export type CalculateRequest = {
  variantKey: string;
  input: Record<string, unknown>;
};

export type CalculateResponse = {
  variantKey: string;
  familyKey: ScenarioFamilyKey;
  normalizedInput: Record<string, unknown>;
  calculation: CalculatorResult;
  filter: ProductSearchFilter;
  explanations: string[];
  matches: ProductSearchResult;
};
