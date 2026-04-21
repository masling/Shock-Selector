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
  cyclesPerHour: positiveIntegerWithDefault(250),
  impactObjectWeightKg: positiveNumber,
  heightM: positiveNumber,
  slopeAngleDeg: positiveNumber,
});

type Input = z.infer<typeof inputSchema>;

const criticalStrokeM = 0.075;

export const linearFreeSlopeCalculator: ScenarioCalculator<Input> = {
  key: "linear-free-slope",
  familyKey: "linear_free_motion",
  validateInput: (input) => inputSchema.parse(input),
  calculate: (input) => {
    const kineticEnergyNm = (9.8 * input.impactObjectWeightKg * input.heightM) / input.absorberCount;
    const workingEnergyNm =
      (9.8 * input.impactObjectWeightKg * Math.sin((input.slopeAngleDeg * 3.14) / 180) * criticalStrokeM) /
      input.absorberCount;
    const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
    const totalEnergyPerHourNm = totalEnergyPerCycleNm * input.cyclesPerHour;
    const thrustForceN =
      (input.impactObjectWeightKg * 9.8 * Math.sin((input.slopeAngleDeg * 3.14) / 180)) /
      input.absorberCount;
    const impactVelocityMs = Math.sqrt(19.6 * input.heightM);
    const decelerationG = impactVelocityMs * impactVelocityMs / (2 * criticalStrokeM) / 9.8;

    return {
      requiredStrokeMm: roundTo(criticalStrokeM * 1000, 2),
      absorbedEnergyPerCycleNm: roundTo(kineticEnergyNm, 3),
      requiredEnergyPerCycleNm: roundTo(totalEnergyPerCycleNm, 3),
      requiredEnergyPerHourNm: roundTo(totalEnergyPerHourNm, 3),
      averageImpactForceN: roundTo(thrustForceN, 3),
      recommendedFamilySlug: recommendProductFamily({
        requiredEnergyPerCycleNm: totalEnergyPerCycleNm,
        cyclesPerHour: input.cyclesPerHour,
        gravityDriven: true,
      }),
      assumptions: [
        "Slope free sliding uses absorber count, cycles per hour, impact object weight, height and slope angle as core conditions.",
        "The height term is treated as kinetic energy and the slope-force term as working energy in this path.",
        "This path uses a fixed critical stroke parameter of 0.075 m.",
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
    minThrustForceN: roundTo(result.averageImpactForceN, 2),
    sortBy: "energyPerCycleNm",
    sortDirection: "asc",
    page: 1,
    pageSize: 8,
  }),
  explain: (input, result) => [
    `Height ${input.heightM} m and slope angle ${input.slopeAngleDeg}° produce kinetic and working energy terms.`,
    `The total energy is ${result.requiredEnergyPerCycleNm} Nm per cycle and ${result.requiredEnergyPerHourNm} Nm per hour.`,
    `Reported thrust force is ${result.averageImpactForceN} N with a fixed critical stroke of ${result.requiredStrokeMm} mm.`,
  ],
};
