import { z } from "zod";
import {
  positiveIntegerWithDefault,
  positiveNumber,
  recommendProductFamily,
  roundTo,
} from "@/lib/calculators/shared";
import type { ScenarioCalculator } from "@/lib/calculators/types";

const inputSchema = z.object({
  absorberCount: positiveIntegerWithDefault(1),
  cyclesPerHour: positiveIntegerWithDefault(200),
  impactObjectWeightKg: positiveNumber,
  speedMs: positiveNumber,
});

type Input = z.infer<typeof inputSchema>;

const criticalStrokeM = 0.05;

export const linearFreeHorizontalCalculator: ScenarioCalculator<Input> = {
  key: "linear-free-horizontal",
  familyKey: "linear_free_motion",
  validateInput: (input) => inputSchema.parse(input),
  calculate: (input) => {
    const kineticEnergyNm =
      (0.5 * input.impactObjectWeightKg * input.speedMs * input.speedMs) / input.absorberCount;
    const workingEnergyNm = 0;
    const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
    const totalEnergyPerHourNm = totalEnergyPerCycleNm * input.cyclesPerHour;
    const thrustForceN = 0;
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
      }),
      assumptions: [
        "Horizontal free motion uses absorber count, cycles per hour, impact object weight and speed as core conditions.",
        "Kinetic energy uses 0.5 * W * v^2 divided by absorber count.",
        "This path uses a fixed critical stroke parameter of 0.05 m.",
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
    sortBy: "energyPerCycleNm",
    sortDirection: "asc",
    page: 1,
    pageSize: 8,
  }),
  explain: (input, result) => [
    `${input.impactObjectWeightKg} kg impact object at ${input.speedMs} m/s creates ${result.absorbedEnergyPerCycleNm} Nm kinetic energy per absorber.`,
    `The total energy is ${result.requiredEnergyPerCycleNm} Nm per cycle and ${result.requiredEnergyPerHourNm} Nm per hour.`,
    `This path uses a fixed critical stroke of ${result.requiredStrokeMm} mm and reports ${result.averageImpactForceN} N thrust.`,
  ],
};
