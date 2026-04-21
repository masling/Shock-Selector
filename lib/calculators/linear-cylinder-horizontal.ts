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
  cyclesPerHour: positiveIntegerWithDefault(200),
  impactObjectWeightKg: positiveNumber,
  speedMs: positiveNumber,
  propulsionCylinderCount: positiveIntegerWithDefault(1),
  cylinderInnerDiameterMm: positiveNumber,
  cylinderWorkPressureBar: positiveNumber,
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

export const linearCylinderHorizontalCalculator: ScenarioCalculator<Input, Output> = {
  key: "linear-cylinder-horizontal",
  familyKey: "linear_cylinder_driven",
  validateInput: (input) => inputSchema.parse(input),
  calculate: (input) => {
    const kineticEnergyNm =
      (0.5 * input.impactObjectWeightKg * input.speedMs * input.speedMs) / input.absorberCount;
    const thrustForceN =
      (0.0785 *
        input.cylinderInnerDiameterMm *
        input.cylinderInnerDiameterMm *
        input.cylinderWorkPressureBar *
        input.propulsionCylinderCount) /
      input.absorberCount;
    const workingEnergyNm = thrustForceN * criticalStrokeM / input.absorberCount;
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
        tuningPreferred: true,
      }),
      assumptions: [
        "Horizontal cylinder-driven motion uses absorber count, cycles per hour, object weight, speed, cylinder count, bore and working pressure as core conditions.",
        "Thrust uses 0.0785 * d^2 * pressure * cylinder count divided by absorber count.",
        "Working energy uses thrust multiplied by the fixed 0.05 m critical stroke and divided again by absorber count.",
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
    `${input.propulsionCylinderCount} cylinder(s) at ${input.cylinderWorkPressureBar} bar and ${input.cylinderInnerDiameterMm} mm inner diameter produce thrust.`,
    `The total energy is ${result.requiredEnergyPerCycleNm} Nm per cycle and ${result.requiredEnergyPerHourNm} Nm per hour.`,
    `Reported thrust force is ${result.averageImpactForceN} N with a fixed critical stroke of ${result.requiredStrokeMm} mm.`,
  ],
};
