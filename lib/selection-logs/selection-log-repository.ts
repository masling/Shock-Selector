import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CalculateResponse } from "@/lib/calculators/types";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createEngineerSelectionLog(result: CalculateResponse) {
  return prisma.selectionLog.create({
    data: {
      viewMode: "ENGINEER",
      familyKey: result.familyKey,
      scenarioKey: result.variantKey,
      rawInputJson: toJsonValue(result.normalizedInput),
      normalizedInputJson: toJsonValue(result.normalizedInput),
      calculationJson: toJsonValue(result.calculation),
      filterJson: toJsonValue(result.filter),
      matchedProductCount: result.matches.total,
      selectedProductIds: toJsonValue(result.matches.items.map((item) => item.id)),
    },
  });
}
