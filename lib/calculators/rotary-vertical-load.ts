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
  cyclesPerHour: positiveIntegerWithDefault(40),
  loadWeightKg: positiveNumber,
  rotationRadiusM: positiveNumber,
  angularSpeedRadS: positiveNumber,
  torqueNm: positiveNumber,
  installationRadiusM: positiveNumber,
  rotationAngleDeg: positiveNumber,
  startAngleFromVerticalDeg: positiveNumber,
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

function createRotaryVerticalLoadCalculator(
  key: "rotary-vertical-load-assisting" | "rotary-vertical-load-opposing",
  assisting: boolean,
): ScenarioCalculator<Input, Output> {
  const criticalStrokeM = 0.025;
  return {
    key,
    familyKey: "rotary_load",
    validateInput: (input) => inputSchema.parse(input),
    calculate: (input) => {
      const kineticEnergyNm =
        (0.5 *
          (input.loadWeightKg * input.rotationRadiusM * input.rotationRadiusM) *
          input.angularSpeedRadS *
          input.angularSpeedRadS) /
        input.absorberCount;
      const gravityTermN = 9.8 * input.loadWeightKg * input.rotationRadiusM;
      const angleFactor = assisting
        ? Math.sin(((input.rotationAngleDeg + input.startAngleFromVerticalDeg) * 3.14) / 180)
        : Math.sin(((input.startAngleFromVerticalDeg - input.rotationAngleDeg) * 3.14) / 180);
      const thrustForceN =
        ((input.torqueNm + (assisting ? 1 : -1) * gravityTermN * angleFactor) /
          input.installationRadiusM) /
        input.absorberCount;
      const workingEnergyNm = thrustForceN * criticalStrokeM;
      const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
      const totalEnergyPerHourNm = totalEnergyPerCycleNm * input.cyclesPerHour;
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
          gravityDriven: assisting,
        }),
        assumptions: [
          "Vertical rotary load uses absorber count, cycles per hour, load weight, rotation radius, angular speed, torque, installation radius, rotation angle and start angle as the core conditions.",
          "Kinetic energy uses 0.5 * (W * K^2) * ω^2 divided by absorber count.",
          assisting
            ? "Working energy uses ((T + 9.8 * W * K * sin(φ + θ)) / Rs) * critical stroke divided by absorber count."
            : "Working energy uses ((T - 9.8 * W * K * sin(θ - φ)) / Rs) * critical stroke divided by absorber count.",
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
      `Load weight ${input.loadWeightKg} kg at ${input.rotationRadiusM} m and ${input.angularSpeedRadS} rad/s creates the kinetic-energy term.`,
      `Torque ${input.torqueNm} Nm, installation radius ${input.installationRadiusM} m and the vertical angle relation determine the working-energy term.`,
      `The total energy is ${result.requiredEnergyPerCycleNm} Nm per cycle and ${result.requiredEnergyPerHourNm} Nm per hour.`,
    ],
  };
}

export const rotaryVerticalLoadAssistingCalculator = createRotaryVerticalLoadCalculator(
  "rotary-vertical-load-assisting",
  true,
);

export const rotaryVerticalLoadOpposingCalculator = createRotaryVerticalLoadCalculator(
  "rotary-vertical-load-opposing",
  false,
);
