import test from "node:test";
import assert from "node:assert/strict";
import { linearFreeHorizontalCalculator } from "./linear-free-horizontal";
import { linearForceHorizontalCalculator } from "./linear-force-horizontal";
import { linearFreeVerticalDropCalculator } from "./linear-free-vertical-drop";
import { rotaryHorizontalLoadCalculator } from "./rotary-horizontal-load";

test("linear-free-horizontal matches reference sample", () => {
  const result = linearFreeHorizontalCalculator.calculate({
    absorberCount: 2,
    cyclesPerHour: 200,
    impactObjectWeightKg: 1800,
    speedMs: 1.5,
  });

  assert.equal(result.absorbedEnergyPerCycleNm, 1012.5);
  assert.equal(result.requiredEnergyPerCycleNm, 1012.5);
  assert.equal(result.requiredEnergyPerHourNm, 202500);
  assert.equal(result.averageImpactForceN, 0);
});

test("linear-force-horizontal matches reference sample", () => {
  const result = linearForceHorizontalCalculator.calculate({
    absorberCount: 2,
    cyclesPerHour: 200,
    impactObjectWeightKg: 1800,
    speedMs: 1.5,
    pushForceN: 2208.9,
  });

  assert.equal(result.absorbedEnergyPerCycleNm, 1012.5);
  assert.equal(result.requiredEnergyPerCycleNm, 1067.723);
  assert.equal(result.requiredEnergyPerHourNm, 213544.5);
  assert.equal(result.averageImpactForceN, 1104.45);
});

test("linear-free-vertical-drop matches reference sample", () => {
  const result = linearFreeVerticalDropCalculator.calculate({
    absorberCount: 2,
    cyclesPerHour: 2,
    impactObjectWeightKg: 3100,
    heightM: 0.5,
  });

  assert.equal(result.absorbedEnergyPerCycleNm, 7595);
  assert.equal(result.requiredEnergyPerCycleNm, 9873.5);
  assert.equal(result.requiredEnergyPerHourNm, 19747);
  assert.equal(result.averageImpactForceN, 15190);
});

test("rotary-horizontal-load matches reference sample", () => {
  const result = rotaryHorizontalLoadCalculator.calculate({
    absorberCount: 1,
    cyclesPerHour: 120,
    loadWeightKg: 90,
    rotationRadiusM: 0.4,
    angularSpeedRadS: 1.5,
    torqueNm: 120,
    installationRadiusM: 0.5,
  });

  assert.equal(result.absorbedEnergyPerCycleNm, 16.2);
  assert.equal(result.requiredEnergyPerCycleNm, 19.2);
  assert.equal(result.requiredEnergyPerHourNm, 2304);
  assert.equal(result.averageImpactForceN, 240);
});
