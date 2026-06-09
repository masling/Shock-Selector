export const selectorSeriesCodes = ["EK", "EKL", "EN", "ES", "EI", "ED"] as const;

export const selectorRequiredSpecKeys = [
  "strokeMm",
  "energyPerCycleNm",
  "energyPerHourNm",
  "maxImpactForceN",
] as const;

export function isSelectorSeriesCode(seriesCode: string) {
  const normalized = seriesCode.trim().toUpperCase();
  return selectorSeriesCodes.some((code) => code === normalized);
}
