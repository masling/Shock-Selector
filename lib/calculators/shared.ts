import { z } from "zod";
import type { CalculatorResult } from "@/lib/calculators/types";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";

export const positiveNumber = z.coerce.number().positive();
export const nonNegativeNumber = z.coerce.number().nonnegative();
export const positiveIntegerWithDefault = (defaultValue: number) =>
  z.coerce.number().int().positive().default(defaultValue);

export function roundTo(value: number, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function kineticEnergyNm(movingMassKg: number, velocityMs: number) {
  return 0.5 * movingMassKg * velocityMs * velocityMs;
}

export function gravityPotentialEnergyNm(movingMassKg: number, heightMm: number) {
  return movingMassKg * 9.80665 * (heightMm / 1000);
}

export function gravityWorkNm(movingMassKg: number, strokeMm: number, assisting: boolean) {
  const directionFactor = assisting ? 1 : -1;
  return gravityPotentialEnergyNm(movingMassKg, strokeMm) * directionFactor;
}

export function averageImpactForceN(energyNm: number, strokeMm: number) {
  return energyNm / Math.max(strokeMm / 1000, 0.001);
}

export function angularSpeedRadS(angularSpeedRpm: number) {
  return (angularSpeedRpm * 2 * Math.PI) / 60;
}

export function arcLengthMm(radiusMm: number, angleDeg: number) {
  return radiusMm * ((angleDeg * Math.PI) / 180);
}

export function slenderRodInertiaKgM2(massKg: number, lengthMm: number) {
  const lengthM = lengthMm / 1000;
  return (massKg * lengthM * lengthM) / 3;
}

export function gravityPotentialShiftNm(massKg: number, radiusMm: number, angleDeg: number) {
  const radiusM = radiusMm / 1000;
  const angleRad = (angleDeg * Math.PI) / 180;
  return massKg * 9.80665 * radiusM * (1 - Math.cos(angleRad));
}

export function recommendProductFamily(input: {
  tuningPreferred?: boolean;
  cyclesPerHour?: number;
  requiredEnergyPerCycleNm: number;
  gravityDriven?: boolean;
}): ProductFamilySlug | null {
  if (input.requiredEnergyPerCycleNm >= 20000 || input.gravityDriven) {
    return "heavy-duty-shock-absorbers";
  }

  if ((input.cyclesPerHour ?? 0) >= 1200) {
    return "super-long-life-shock-absorbers";
  }

  if (input.tuningPreferred) {
    return "adjustable-shock-absorbers";
  }

  return "non-adjustable-shock-absorbers";
}

export function buildStandardFilter(result: CalculatorResult) {
  return {
    minStrokeMm: roundTo(result.requiredStrokeMm, 2),
    minEnergyPerCycleNm: roundTo(result.requiredEnergyPerCycleNm, 2),
    minEnergyPerHourNm: roundTo(result.requiredEnergyPerHourNm, 2),
    minImpactForceN: roundTo(result.averageImpactForceN, 2),
    sortBy: "energyPerCycleNm" as const,
    sortDirection: "asc" as const,
    page: 1,
    pageSize: 8,
  };
}
