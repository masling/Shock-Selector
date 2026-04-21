import { z } from "zod";
import { getCalculator } from "@/lib/calculators/calculator-registry";
import type { CalculateResponse } from "@/lib/calculators/types";
import { locales } from "@/lib/i18n/config";
import { productSearchService } from "@/lib/products/product-search-service";
import { createEngineerSelectionLog } from "@/lib/selection-logs/selection-log-repository";
import { getScenarioVariant } from "@/lib/scenarios/registry";

export class UnsupportedScenarioError extends Error {}

const calculateRequestSchema = z.object({
  variantKey: z.string().trim().min(1),
  input: z.record(z.string(), z.unknown()).default({}),
  locale: z.enum(locales).default("en"),
});

export async function calculatorService(rawRequest: unknown): Promise<CalculateResponse> {
  const request = calculateRequestSchema.parse(rawRequest);

  const scenario = getScenarioVariant(request.variantKey);
  const calculator = getCalculator(request.variantKey);

  if (!scenario || !scenario.isImplemented || !calculator) {
    throw new UnsupportedScenarioError(`Scenario ${request.variantKey} is not implemented yet.`);
  }

  const normalizedInput = calculator.validateInput(request.input) as Record<string, unknown>;
  const calculation = calculator.calculate(normalizedInput);
  const filter = calculator.buildFilter(calculation);
  const matches = await productSearchService({
    ...filter,
    locale: request.locale,
  });
  const explanations = calculator.explain?.(normalizedInput, calculation) ?? [];

  const result: CalculateResponse = {
    variantKey: request.variantKey,
    familyKey: calculator.familyKey,
    normalizedInput,
    calculation,
    filter,
    explanations: [...explanations, ...calculation.assumptions],
    matches,
  };

  try {
    await createEngineerSelectionLog(result);
  } catch (error) {
    console.error("Selection log write skipped.", error);
  }

  return result;
}
