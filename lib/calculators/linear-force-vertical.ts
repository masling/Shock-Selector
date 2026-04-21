import { z } from "zod";
import {
  positiveIntegerWithDefault,
  positiveNumber,
  recommendProductFamily,
  roundTo,
} from "@/lib/calculators/shared";
import type { ScenarioCalculator } from "@/lib/calculators/types";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";

const inputSchema = z.object({
  absorberCount: positiveIntegerWithDefault(1),
  cyclesPerHour: positiveIntegerWithDefault(100),
  impactObjectWeightKg: positiveNumber,
  speedMs: positiveNumber,
  pushForceN: positiveNumber,
});

type Input = z.infer<typeof inputSchema>;

type Output = {
  requiredStrokeMm: number;
  absorbedEnergyPerCycleNm: number;
  requiredEnergyPerCycleNm: number;
  requiredEnergyPerHourNm: number;
  averageImpactForceN: number;
  recommendedFamilySlug: ProductFamilySlug | null;
  assumptions: string[];
  detailMetrics: Array<{
    key: string;
    value: number;
    unit: string;
  }>;
};

const criticalStrokeM = 0.05;

function createLinearForceVerticalCalculator(
  key: "linear-force-vertical-assisting" | "linear-force-vertical-opposing",
  assisting: boolean,
): ScenarioCalculator<Input, Output> {
  return {
    key,
    familyKey: "linear_force_driven",
    validateInput: (input) => inputSchema.parse(input),
    calculate: (input) => {
      const kineticEnergyNm =
        (0.5 * input.impactObjectWeightKg * input.speedMs * input.speedMs) / input.absorberCount;
      const thrustForceN =
        (input.pushForceN + (assisting ? 1 : -1) * (9.8 * input.impactObjectWeightKg)) /
        input.absorberCount;
      const workingEnergyNm = thrustForceN * criticalStrokeM;
      const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
      const totalEnergyPerHourNm = totalEnergyPerCycleNm * input.cyclesPerHour;
      const decelerationG = input.speedMs * input.speedMs / (2 * criticalStrokeM) / 9.8;
      const impactVelocityMs = input.speedMs;

      return {
        requiredStrokeMm: roundTo(criticalStrokeM * 1000, 2),
        absorbedEnergyPerCycleNm: roundTo(kineticEnergyNm, 3),
        requiredEnergyPerCycleNm: roundTo(totalEnergyPerCycleNm, 3),
        requiredEnergyPerHourNm: roundTo(totalEnergyPerHourNm, 3),
        averageImpactForceN: roundTo(thrustForceN, 3),
        recommendedFamilySlug: recommendProductFamily({
          requiredEnergyPerCycleNm: totalEnergyPerCycleNm,
          cyclesPerHour: input.cyclesPerHour,
          tuningPreferred: input.pushForceN > 1500,
          gravityDriven: assisting,
        }),
        assumptions: [
          "Vertical force-driven motion uses absorber count, cycles per hour, impact object weight, speed and push force as the core conditions.",
          assisting
            ? "Working energy uses (push force + 9.8 * weight) * critical stroke divided by absorber count."
            : "Working energy uses (push force - 9.8 * weight) * critical stroke divided by absorber count.",
          "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
        ],
        detailMetrics: [
          { key: "kineticEnergyNm", value: roundTo(kineticEnergyNm, 3), unit: "Nm" },
          { key: "workingEnergyNm", value: roundTo(workingEnergyNm, 3), unit: "Nm" },
          { key: "totalEnergyPerCycleNm", value: roundTo(totalEnergyPerCycleNm, 3), unit: "Nm/c" },
          { key: "totalEnergyPerHourNm", value: roundTo(totalEnergyPerHourNm, 3), unit: "Nm/h" },
          { key: "thrustForceN", value: roundTo(thrustForceN, 3), unit: "N" },
          { key: "decelerationG", value: roundTo(decelerationG, 3), unit: "G" },
          { key: "impactVelocityMs", value: roundTo(impactVelocityMs, 3), unit: "m/s" },
        ],
      };
    },
    buildFilter: (result) => ({
      minStrokeMm: roundTo(result.requiredStrokeMm, 2),
      minEnergyPerCycleNm: roundTo(result.requiredEnergyPerCycleNm, 2),
      minEnergyPerHourNm: roundTo(result.requiredEnergyPerHourNm, 2),
      minThrustForceN: roundTo(Math.max(result.averageImpactForceN, 0), 2),
      sortBy: "energyPerCycleNm",
      sortDirection: "asc",
      page: 1,
      pageSize: 8,
    }),
    explain: (input, result) => [
      `Push force ${input.pushForceN} N is combined with the vertical gravity term to build the working-energy result.`,
      `The total energy is ${result.requiredEnergyPerCycleNm} Nm per cycle and ${result.requiredEnergyPerHourNm} Nm per hour.`,
      `Reported thrust force is ${result.averageImpactForceN} N with a fixed critical stroke of ${result.requiredStrokeMm} mm.`,
    ],
  };
}

export const linearForceVerticalAssistingCalculator =
  createLinearForceVerticalCalculator("linear-force-vertical-assisting", true);

export const linearForceVerticalOpposingCalculator =
  createLinearForceVerticalCalculator("linear-force-vertical-opposing", false);
