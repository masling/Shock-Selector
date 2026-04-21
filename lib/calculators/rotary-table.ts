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
  cyclesPerHour: positiveIntegerWithDefault(1),
  tableWeightKg: positiveNumber,
  loadWeightW1Kg: positiveNumber,
  rotationRadiusM: positiveNumber,
  tableDiameterM: positiveNumber,
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

const criticalStrokeM = 0.016;

export const rotaryHorizontalTableCalculator: ScenarioCalculator<Input, Output> = {
  key: "rotary-horizontal-table",
  familyKey: "rotary_table",
  validateInput: (input) => inputSchema.parse(input),
  calculate: (input) => {
    const kineticEnergyNm =
      ((((0.707 * (input.tableDiameterM / 2)) ** 2) * input.tableWeightKg) +
        (input.loadWeightW1Kg * input.rotationRadiusM * input.rotationRadiusM)) *
      0.5 *
      input.angularSpeedRadS /
      input.absorberCount;
    const workingEnergyNm =
      ((input.torqueNm / input.installationRadiusM) / input.absorberCount) * criticalStrokeM;
    const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
    const totalEnergyPerHourNm = totalEnergyPerCycleNm * input.cyclesPerHour;
    const thrustForceN =
      (input.torqueNm / input.installationRadiusM) / input.absorberCount;
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
        "Horizontal rotary table uses absorber count, cycles per hour, table weight, load weight, rotation radius, table diameter, angular speed, torque and installation radius as the core conditions.",
        "The kinetic term uses (((0.707 * (d / 2))^2 * table weight) + (load weight * K^2)) * 0.5 * ω / absorber count.",
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
    `Table weight ${input.tableWeightKg} kg and load weight ${input.loadWeightW1Kg} kg create the kinetic-energy term together with diameter and rotation radius.`,
    `Torque ${input.torqueNm} Nm and installation radius ${input.installationRadiusM} m determine the working-energy and thrust terms.`,
    `The total energy is ${result.requiredEnergyPerCycleNm} Nm per cycle and ${result.requiredEnergyPerHourNm} Nm per hour.`,
  ],
};
