import { z } from "zod";
import {
  positiveIntegerWithDefault,
  positiveNumber,
  recommendProductFamily,
  roundTo,
} from "@/lib/calculators/shared";
import type { ScenarioCalculator } from "@/lib/calculators/types";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";

const horizontalInputSchema = z.object({
  absorberCount: positiveIntegerWithDefault(1),
  cyclesPerHour: positiveIntegerWithDefault(40),
  beamWeightKg: positiveNumber,
  beamLengthM: positiveNumber,
  beamThicknessM: positiveNumber,
  angularSpeedRadS: positiveNumber,
  torqueNm: positiveNumber,
  installationRadiusM: positiveNumber,
});

const verticalInputSchema = z.object({
  absorberCount: positiveIntegerWithDefault(1),
  cyclesPerHour: positiveIntegerWithDefault(40),
  gateWeightKg: positiveNumber,
  gateWidthM: positiveNumber,
  gateThicknessM: positiveNumber,
  angularSpeedRadS: positiveNumber,
  torqueNm: positiveNumber,
  installationRadiusM: positiveNumber,
  rotationAngleDeg: positiveNumber,
  startAngleFromVerticalDeg: positiveNumber,
});

type HorizontalInput = z.infer<typeof horizontalInputSchema>;
type VerticalInput = z.infer<typeof verticalInputSchema>;

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

function createRotaryBeamOrGateCalculator(
  key:
    | "rotary-horizontal-beam-or-gate"
    | "rotary-vertical-beam-or-gate-assisting"
    | "rotary-vertical-beam-or-gate-opposing",
  gravityMode: "none" | "assisting" | "opposing",
): ScenarioCalculator<HorizontalInput | VerticalInput, Output> {
  const criticalStrokeM = gravityMode === "none" ? 0.025 : 0.05;
  return {
    key,
    familyKey: "rotary_beam_or_gate",
    validateInput: (input) =>
      gravityMode === "none"
        ? horizontalInputSchema.parse(input)
        : verticalInputSchema.parse(input),
    calculate: (input) => {
      if (gravityMode === "none") {
        const normalized = input as HorizontalInput;
        const equivalentRadiusM =
          0.289 * Math.sqrt((4 * normalized.beamLengthM * normalized.beamLengthM) + (normalized.beamThicknessM * normalized.beamThicknessM));
        const kineticEnergyNm =
          (equivalentRadiusM * equivalentRadiusM * normalized.beamWeightKg * 0.5 * normalized.angularSpeedRadS * normalized.angularSpeedRadS) /
          normalized.absorberCount;
        const workingEnergyNm =
          ((normalized.torqueNm / normalized.installationRadiusM) * criticalStrokeM) /
          normalized.absorberCount;
        const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
        const totalEnergyPerHourNm = totalEnergyPerCycleNm * normalized.cyclesPerHour;
        const thrustForceN =
          (normalized.torqueNm / normalized.installationRadiusM) / normalized.absorberCount;
        const impactVelocityMs = normalized.angularSpeedRadS * normalized.installationRadiusM;
        const decelerationG = impactVelocityMs * impactVelocityMs / (2 * criticalStrokeM) / 9.8;

        return {
          requiredStrokeMm: roundTo(criticalStrokeM * 1000, 2),
          absorbedEnergyPerCycleNm: roundTo(kineticEnergyNm, 3),
          requiredEnergyPerCycleNm: roundTo(totalEnergyPerCycleNm, 3),
          requiredEnergyPerHourNm: roundTo(totalEnergyPerHourNm, 3),
          averageImpactForceN: roundTo(thrustForceN, 3),
          recommendedFamilySlug: recommendProductFamily({
            requiredEnergyPerCycleNm: totalEnergyPerCycleNm,
            cyclesPerHour: normalized.cyclesPerHour,
          }),
          assumptions: [
            "Horizontal beam / gate uses absorber count, cycles per hour, beam weight, length, thickness, angular speed, torque and installation radius as the core conditions.",
            "The equivalent radius 0.289 * sqrt(4 * L^2 + B^2) is used to derive kinetic energy.",
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
      }

      const normalized = input as VerticalInput;
      const equivalentRadiusM =
        0.289 * Math.sqrt((4 * normalized.gateWidthM * normalized.gateWidthM) + (normalized.gateThicknessM * normalized.gateThicknessM));
      const kineticEnergyNm =
        (0.5 * (normalized.gateWeightKg * equivalentRadiusM * equivalentRadiusM) * normalized.angularSpeedRadS * normalized.angularSpeedRadS) /
        normalized.absorberCount;
      const gravityAngleFactor = gravityMode === "assisting"
        ? Math.sin(((normalized.rotationAngleDeg + normalized.startAngleFromVerticalDeg) * 3.14) / 180)
        : Math.sin(((normalized.startAngleFromVerticalDeg - normalized.rotationAngleDeg) * 3.14) / 180);
      const thrustForceN =
        ((normalized.torqueNm +
          (gravityMode === "assisting" ? 1 : -1) * (9.8 * normalized.gateWeightKg * equivalentRadiusM * gravityAngleFactor)) /
          normalized.installationRadiusM) /
        normalized.absorberCount;
      const workingEnergyNm = thrustForceN * criticalStrokeM;
      const totalEnergyPerCycleNm = kineticEnergyNm + workingEnergyNm;
      const totalEnergyPerHourNm = totalEnergyPerCycleNm * normalized.cyclesPerHour;
      const impactVelocityMs = normalized.installationRadiusM * normalized.angularSpeedRadS;
      const decelerationG = impactVelocityMs * impactVelocityMs / (2 * criticalStrokeM) / 9.8;

      return {
        requiredStrokeMm: roundTo(criticalStrokeM * 1000, 2),
        absorbedEnergyPerCycleNm: roundTo(kineticEnergyNm, 3),
        requiredEnergyPerCycleNm: roundTo(totalEnergyPerCycleNm, 3),
        requiredEnergyPerHourNm: roundTo(totalEnergyPerHourNm, 3),
        averageImpactForceN: roundTo(thrustForceN, 3),
        recommendedFamilySlug: recommendProductFamily({
          requiredEnergyPerCycleNm: totalEnergyPerCycleNm,
          cyclesPerHour: normalized.cyclesPerHour,
          gravityDriven: gravityMode === "assisting",
        }),
        assumptions: [
          "Vertical beam / gate uses absorber count, cycles per hour, gate weight, width, thickness, angular speed, torque, installation radius, rotation angle and start angle as the core conditions.",
          "The equivalent radius 0.289 * sqrt(4 * A^2 + B^2) is used to derive kinetic energy.",
          gravityMode === "assisting"
            ? "Working energy uses ((T + 9.8 * W * equivalent radius * sin(φ + θ)) / Rs) * critical stroke divided by absorber count."
            : "Working energy uses ((T - 9.8 * W * equivalent radius * sin(θ - φ)) / Rs) * critical stroke divided by absorber count.",
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
      gravityMode === "none"
        ? `${(input as HorizontalInput).beamWeightKg} kg beam with ${(input as HorizontalInput).beamLengthM} m length and ${(input as HorizontalInput).beamThicknessM} m thickness creates the kinetic-energy term.`
        : `${(input as VerticalInput).gateWeightKg} kg gate with ${(input as VerticalInput).gateWidthM} m width and ${(input as VerticalInput).gateThicknessM} m thickness creates the kinetic-energy term.`,
      `The total energy is ${result.requiredEnergyPerCycleNm} Nm per cycle and ${result.requiredEnergyPerHourNm} Nm per hour.`,
      `Reported thrust force is ${result.averageImpactForceN} N with a fixed critical stroke of ${result.requiredStrokeMm} mm.`,
    ],
  };
}

export const rotaryHorizontalBeamOrGateCalculator = createRotaryBeamOrGateCalculator(
  "rotary-horizontal-beam-or-gate",
  "none",
);

export const rotaryVerticalBeamOrGateAssistingCalculator = createRotaryBeamOrGateCalculator(
  "rotary-vertical-beam-or-gate-assisting",
  "assisting",
);

export const rotaryVerticalBeamOrGateOpposingCalculator = createRotaryBeamOrGateCalculator(
  "rotary-vertical-beam-or-gate-opposing",
  "opposing",
);
