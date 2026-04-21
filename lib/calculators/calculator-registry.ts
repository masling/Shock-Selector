import { linearCylinderHorizontalCalculator } from "@/lib/calculators/linear-cylinder-horizontal";
import {
  linearCylinderVerticalAssistingCalculator,
  linearCylinderVerticalOpposingCalculator,
} from "@/lib/calculators/linear-cylinder-vertical";
import {
  linearForceVerticalAssistingCalculator,
  linearForceVerticalOpposingCalculator,
} from "@/lib/calculators/linear-force-vertical";
import { linearForceHorizontalCalculator } from "@/lib/calculators/linear-force-horizontal";
import { linearFreeHorizontalCalculator } from "@/lib/calculators/linear-free-horizontal";
import { linearFreeSlopeCalculator } from "@/lib/calculators/linear-free-slope";
import { linearFreeVerticalDropCalculator } from "@/lib/calculators/linear-free-vertical-drop";
import { linearMotorHorizontalCalculator } from "@/lib/calculators/linear-motor-horizontal";
import {
  linearMotorVerticalAssistingCalculator,
  linearMotorVerticalOpposingCalculator,
} from "@/lib/calculators/linear-motor-vertical";
import {
  rotaryHorizontalBeamOrGateCalculator,
  rotaryVerticalBeamOrGateAssistingCalculator,
  rotaryVerticalBeamOrGateOpposingCalculator,
} from "@/lib/calculators/rotary-beam-or-gate";
import { rotaryHorizontalLoadCalculator } from "@/lib/calculators/rotary-horizontal-load";
import { rotaryHorizontalTableCalculator } from "@/lib/calculators/rotary-table";
import {
  rotaryVerticalLoadAssistingCalculator,
  rotaryVerticalLoadOpposingCalculator,
} from "@/lib/calculators/rotary-vertical-load";
import type { CalculatorResult, ScenarioCalculator } from "@/lib/calculators/types";

type AnyScenarioCalculator = ScenarioCalculator<Record<string, unknown>, CalculatorResult>;

const calculatorRegistry = new Map<string, AnyScenarioCalculator>([
  [
    linearFreeHorizontalCalculator.key,
    linearFreeHorizontalCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearFreeSlopeCalculator.key,
    linearFreeSlopeCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearMotorHorizontalCalculator.key,
    linearMotorHorizontalCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearForceHorizontalCalculator.key,
    linearForceHorizontalCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearForceVerticalAssistingCalculator.key,
    linearForceVerticalAssistingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearForceVerticalOpposingCalculator.key,
    linearForceVerticalOpposingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearCylinderHorizontalCalculator.key,
    linearCylinderHorizontalCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearCylinderVerticalAssistingCalculator.key,
    linearCylinderVerticalAssistingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearCylinderVerticalOpposingCalculator.key,
    linearCylinderVerticalOpposingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearFreeVerticalDropCalculator.key,
    linearFreeVerticalDropCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearMotorVerticalAssistingCalculator.key,
    linearMotorVerticalAssistingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    linearMotorVerticalOpposingCalculator.key,
    linearMotorVerticalOpposingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    rotaryHorizontalLoadCalculator.key,
    rotaryHorizontalLoadCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    rotaryVerticalLoadAssistingCalculator.key,
    rotaryVerticalLoadAssistingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    rotaryVerticalLoadOpposingCalculator.key,
    rotaryVerticalLoadOpposingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    rotaryHorizontalBeamOrGateCalculator.key,
    rotaryHorizontalBeamOrGateCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    rotaryVerticalBeamOrGateAssistingCalculator.key,
    rotaryVerticalBeamOrGateAssistingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    rotaryVerticalBeamOrGateOpposingCalculator.key,
    rotaryVerticalBeamOrGateOpposingCalculator as unknown as AnyScenarioCalculator,
  ],
  [
    rotaryHorizontalTableCalculator.key,
    rotaryHorizontalTableCalculator as unknown as AnyScenarioCalculator,
  ],
]);

export function getCalculator(variantKey: string) {
  return calculatorRegistry.get(variantKey) ?? null;
}

export function listImplementedCalculators() {
  return [...calculatorRegistry.values()];
}
