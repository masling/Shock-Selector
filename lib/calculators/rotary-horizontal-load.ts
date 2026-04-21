import { z } from "zod";
import {
  averageImpactForceN,
  positiveIntegerWithDefault,
  positiveNumber,
  recommendProductFamily,
  roundTo,
} from "@/lib/calculators/shared";
import type { ScenarioCalculator } from "@/lib/calculators/types";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";

const inputSchema = z.object({
  absorberCount: positiveIntegerWithDefault(1),
  cyclesPerHour: positiveIntegerWithDefault(40),
  loadWeightKg: positiveNumber,
  rotationRadiusM: positiveNumber,
  angularSpeedRadS: positiveNumber,
  torqueNm: positiveNumber,
  installationRadiusM: positiveNumber,
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

const criticalStrokeM = 0.0125;

export const rotaryHorizontalLoadCalculator: ScenarioCalculator<Input, Output> = {
  key: "rotary-horizontal-load",
  familyKey: "rotary_load",
  validateInput: (input) => inputSchema.parse(input),
  calculate: (input) => {
    const kineticEnergyNm =
      (0.5 * (input.loadWeightKg * input.rotationRadiusM * input.rotationRadiusM) * input.angularSpeedRadS * input.angularSpeedRadS) /
      input.absorberCount;
    const workingEnergyNm =
      ((input.torqueNm / input.installationRadiusM) * criticalStrokeM) / input.absorberCount;
    const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
    const totalEnergyPerHourNm = totalEnergyPerCycleNm * input.cyclesPerHour;
    const thrustForceN = (input.torqueNm / input.installationRadiusM) / input.absorberCount;
    const impactVelocityMs = input.installationRadiusM * input.angularSpeedRadS;
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
      }),
      assumptions: [
        "Horizontal rotary load uses load weight, rotation radius, angular speed, torque and installation radius as the core conditions.",
        "Kinetic energy uses 0.5 * (W * K^2) * ω^2 divided by absorber count.",
        "Working energy uses (T / Rs) * critical stroke divided by absorber count.",
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
    `${input.loadWeightKg} kg load at ${input.rotationRadiusM} m rotation radius and ${input.angularSpeedRadS} rad/s creates ${result.absorbedEnergyPerCycleNm} Nm kinetic energy per absorber.`,
    `Torque ${input.torqueNm} Nm over installation radius ${input.installationRadiusM} m adds working energy to reach ${result.requiredEnergyPerCycleNm} Nm per cycle.`,
    `The thrust result is ${result.averageImpactForceN} N with a critical stroke of ${result.requiredStrokeMm} mm.`,
  ],
};
