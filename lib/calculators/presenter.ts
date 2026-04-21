import type { CalculateResponse, CalculatorResult } from "@/lib/calculators/types";
import type { Locale } from "@/lib/i18n/config";

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function localizeAssumptions(
  variantKey: string,
  locale: Locale,
) {
  const english: Record<string, string[]> = {
    "linear-free-horizontal": [
      "Horizontal free motion uses absorber count, cycles per hour, impact object weight and speed as the core conditions.",
      "Kinetic energy uses 0.5 * W * v^2 divided by absorber count.",
      "This path uses a fixed critical stroke parameter of 0.05 m.",
    ],
    "linear-free-slope": [
      "Slope free sliding uses absorber count, cycles per hour, impact object weight, height and slope angle as the core conditions.",
      "The height term is treated as kinetic energy and the slope-force term as working energy in this path.",
      "This path uses a fixed critical stroke parameter of 0.075 m.",
    ],
    "linear-free-vertical-drop": [
      "Vertical free drop uses absorber count, cycles per hour, impact object weight and height as the core conditions.",
      "The height-derived term is treated as kinetic energy and the gravity term over the critical stroke is treated as working energy.",
      "This path uses the fixed critical stroke parameter of 0.15 m.",
    ],
    "linear-force-horizontal": [
      "Horizontal force-driven motion uses absorber count, cycles per hour, object weight, speed and push force as the core conditions.",
      "Working energy uses push force multiplied by the fixed 0.05 m critical stroke.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "linear-force-vertical-assisting": [
      "Vertical force-driven motion uses absorber count, cycles per hour, impact object weight, speed and push force as the core conditions.",
      "Working energy uses (push force + 9.8 * weight) * critical stroke divided by absorber count.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "linear-force-vertical-opposing": [
      "Vertical force-driven motion uses absorber count, cycles per hour, impact object weight, speed and push force as the core conditions.",
      "Working energy uses (push force - 9.8 * weight) * critical stroke divided by absorber count.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "linear-motor-horizontal": [
      "Horizontal motor-driven motion uses absorber count, cycles per hour, object weight, speed and motor power as the core conditions.",
      "Working energy uses ((3000 * motor power) / speed) * critical stroke divided by absorber count.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "linear-motor-vertical-assisting": [
      "Vertical motor-driven motion uses absorber count, cycles per hour, impact object weight, speed and motor power as the core conditions.",
      "Working energy uses (((3000 * motor power) / speed) + 9.8 * weight) * critical stroke divided by absorber count.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "linear-motor-vertical-opposing": [
      "Vertical motor-driven motion uses absorber count, cycles per hour, impact object weight, speed and motor power as the core conditions.",
      "Working energy uses (((3000 * motor power) / speed) - 9.8 * weight) * critical stroke divided by absorber count.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "linear-cylinder-horizontal": [
      "Horizontal cylinder-driven motion uses absorber count, cycles per hour, object weight, speed, cylinder count, bore and working pressure as the core conditions.",
      "Thrust uses 0.0785 * d^2 * pressure * cylinder count divided by absorber count.",
      "Working energy uses thrust multiplied by the fixed 0.05 m critical stroke and divided again by absorber count.",
    ],
    "linear-cylinder-vertical-assisting": [
      "Vertical cylinder-driven motion uses absorber count, cycles per hour, object weight, speed, cylinder count, bore and working pressure as the core conditions.",
      "Working energy uses ((0.0785 * d^2 * pressure * cylinder count) + 9.8 * weight) * critical stroke divided by absorber count.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "linear-cylinder-vertical-opposing": [
      "Vertical cylinder-driven motion uses absorber count, cycles per hour, object weight, speed, cylinder count, bore and working pressure as the core conditions.",
      "Working energy uses ((0.0785 * d^2 * pressure * cylinder count) - 9.8 * weight) * critical stroke divided by absorber count.",
      "The result also includes thrust force, deceleration and impact velocity together with the energy totals.",
    ],
    "rotary-horizontal-load": [
      "Horizontal rotary load uses load weight, rotation radius, angular speed, torque and installation radius as the core conditions.",
      "Kinetic energy uses 0.5 * (W * K^2) * ω^2 divided by absorber count.",
      "Working energy uses (T / Rs) * critical stroke divided by absorber count.",
    ],
    "rotary-vertical-load-assisting": [
      "Vertical rotary load uses absorber count, cycles per hour, load weight, rotation radius, angular speed, torque, installation radius, rotation angle and start angle as the core conditions.",
      "Kinetic energy uses 0.5 * (W * K^2) * ω^2 divided by absorber count.",
      "Working energy uses ((T + 9.8 * W * K * sin(φ + θ)) / Rs) * critical stroke divided by absorber count.",
    ],
    "rotary-vertical-load-opposing": [
      "Vertical rotary load uses absorber count, cycles per hour, load weight, rotation radius, angular speed, torque, installation radius, rotation angle and start angle as the core conditions.",
      "Kinetic energy uses 0.5 * (W * K^2) * ω^2 divided by absorber count.",
      "Working energy uses ((T - 9.8 * W * K * sin(θ - φ)) / Rs) * critical stroke divided by absorber count.",
    ],
    "rotary-horizontal-beam-or-gate": [
      "Horizontal beam / gate uses absorber count, cycles per hour, beam weight, length, thickness, angular speed, torque and installation radius as the core conditions.",
      "The equivalent radius 0.289 * sqrt(4 * L^2 + B^2) is used to derive kinetic energy.",
      "Working energy uses (T / Rs) * critical stroke divided by absorber count.",
    ],
    "rotary-vertical-beam-or-gate-assisting": [
      "Vertical beam / gate uses absorber count, cycles per hour, gate weight, width, thickness, angular speed, torque, installation radius, rotation angle and start angle as the core conditions.",
      "The equivalent radius 0.289 * sqrt(4 * A^2 + B^2) is used to derive kinetic energy.",
      "Working energy uses ((T + 9.8 * W * equivalent radius * sin(φ + θ)) / Rs) * critical stroke divided by absorber count.",
    ],
    "rotary-vertical-beam-or-gate-opposing": [
      "Vertical beam / gate uses absorber count, cycles per hour, gate weight, width, thickness, angular speed, torque, installation radius, rotation angle and start angle as the core conditions.",
      "The equivalent radius 0.289 * sqrt(4 * A^2 + B^2) is used to derive kinetic energy.",
      "Working energy uses ((T - 9.8 * W * equivalent radius * sin(θ - φ)) / Rs) * critical stroke divided by absorber count.",
    ],
    "rotary-horizontal-table": [
      "Horizontal rotary table uses absorber count, cycles per hour, table weight, load weight, rotation radius, table diameter, angular speed, torque and installation radius as the core conditions.",
      "The kinetic term uses (((0.707 * (d / 2))^2 * table weight) + (load weight * K^2)) * 0.5 * ω / absorber count.",
      "Working energy uses (T / Rs) * critical stroke divided by absorber count.",
    ],
  };

  const chinese: Record<string, string[]> = {
    "linear-free-horizontal": [
      "水平自由运动以缓冲器数量、循环次数、冲击物体重量、速度为核心条件。",
      "动能按 0.5 * W * v^2 / n 计算。",
      "该计算路径使用固定关键行程参数 0.05 m。",
    ],
    "linear-free-slope": [
      "斜坡自由滑动以缓冲器数量、循环次数、冲击物体重量、高度、斜角为核心条件。",
      "该计算路径中高度项作为动能，斜坡分力项作为做功能量。",
      "该计算路径使用固定关键行程参数 0.075 m。",
    ],
    "linear-free-vertical-drop": [
      "垂直自由落体以缓冲器数量、循环次数、冲击物体重量、高度为核心条件。",
      "该计算路径中高度项作为动能，关键行程参数内的重力项作为做功能量。",
      "该计算路径使用固定关键行程参数 0.15 m。",
    ],
    "linear-force-horizontal": [
      "水平附加推进力以缓冲器数量、循环次数、冲击物体重量、速度、推进力为核心条件。",
      "做功能量按 推进力 * 关键行程参数 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "linear-force-vertical-assisting": [
      "垂直推进力（重力同向）以缓冲器数量、循环次数、冲击物体重量、速度、推进力为核心条件。",
      "做功能量按 (推进力 + 9.8 * 重量) * 关键行程参数 / 缓冲器数量 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "linear-force-vertical-opposing": [
      "垂直推进力（重力反向）以缓冲器数量、循环次数、冲击物体重量、速度、推进力为核心条件。",
      "做功能量按 (推进力 - 9.8 * 重量) * 关键行程参数 / 缓冲器数量 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "linear-motor-horizontal": [
      "水平电机驱动以缓冲器数量、循环次数、冲击物体重量、速度、电机功率为核心条件。",
      "做功能量按 ((3000 * 电机功率) / 速度) * 关键行程参数 / n 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "linear-motor-vertical-assisting": [
      "垂直电机驱动（重力同向）以缓冲器数量、循环次数、冲击物体重量、速度、电机功率为核心条件。",
      "做功能量按 (((3000 * 电机功率) / 速度) + 9.8 * 重量) * 关键行程参数 / 缓冲器数量 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "linear-motor-vertical-opposing": [
      "垂直电机驱动（重力反向）以缓冲器数量、循环次数、冲击物体重量、速度、电机功率为核心条件。",
      "做功能量按 (((3000 * 电机功率) / 速度) - 9.8 * 重量) * 关键行程参数 / 缓冲器数量 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "linear-cylinder-horizontal": [
      "水平气缸驱动以缓冲器数量、循环次数、冲击物体重量、速度、推进气缸数量、气缸内径、气缸工作压力为核心条件。",
      "推进力按 0.0785 * d^2 * 压力 * 气缸数量 / 缓冲器数量 计算。",
      "做功能量按 推进力 * 关键行程参数 / 缓冲器数量 计算。",
    ],
    "linear-cylinder-vertical-assisting": [
      "垂直气缸驱动（重力同向）以缓冲器数量、循环次数、冲击物体重量、速度、推进气缸数量、气缸内径、气缸工作压力为核心条件。",
      "做功能量按 ((0.0785 * d^2 * 压力 * 气缸数量) + 9.8 * 重量) * 关键行程参数 / 缓冲器数量 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "linear-cylinder-vertical-opposing": [
      "垂直气缸驱动（重力反向）以缓冲器数量、循环次数、冲击物体重量、速度、推进气缸数量、气缸内径、气缸工作压力为核心条件。",
      "做功能量按 ((0.0785 * d^2 * 压力 * 气缸数量) - 9.8 * 重量) * 关键行程参数 / 缓冲器数量 计算。",
      "结果会同时给出推进力、减速加速度和冲击速度。",
    ],
    "rotary-horizontal-load": [
      "水平旋转负荷以负荷重量、旋转半径、角速度、扭矩、安装半径为核心条件。",
      "动能按 0.5 * (W * K^2) * ω^2 / n 计算。",
      "做功能量按 (T / Rs) * 关键行程参数 / n 计算。",
    ],
    "rotary-vertical-load-assisting": [
      "垂直旋转负荷以缓冲器数量、循环次数、负荷重量、旋转半径、角速度、扭矩、安装半径、旋转角度、起点对应垂直线角度为核心条件。",
      "动能按 0.5 * (W * K^2) * ω^2 / n 计算。",
      "做功能量按 ((T + 9.8 * W * K * sin(φ + θ)) / Rs) * 关键行程参数 / n 计算。",
    ],
    "rotary-vertical-load-opposing": [
      "垂直旋转负荷以缓冲器数量、循环次数、负荷重量、旋转半径、角速度、扭矩、安装半径、旋转角度、起点对应垂直线角度为核心条件。",
      "动能按 0.5 * (W * K^2) * ω^2 / n 计算。",
      "做功能量按 ((T - 9.8 * W * K * sin(θ - φ)) / Rs) * 关键行程参数 / n 计算。",
    ],
    "rotary-horizontal-beam-or-gate": [
      "水平旋转横梁 / 挡板以缓冲器数量、循环次数、横梁重量、长度、厚度、角速度、扭矩、安装半径为核心条件。",
      "使用等效半径 0.289 * sqrt(4 * L^2 + B^2) 计算动能。",
      "做功能量按 (T / Rs) * 关键行程参数 / n 计算。",
    ],
    "rotary-vertical-beam-or-gate-assisting": [
      "垂直旋转横梁 / 挡板（重力同向）以缓冲器数量、循环次数、挡板重量、宽度、厚度、角速度、扭矩、安装半径、旋转角度、起点对应垂直线角度为核心条件。",
      "使用等效半径 0.289 * sqrt(4 * A^2 + B^2) 计算动能。",
      "做功能量按 ((T + 9.8 * W * 等效半径 * sin(φ + θ)) / Rs) * 关键行程参数 / n 计算。",
    ],
    "rotary-vertical-beam-or-gate-opposing": [
      "垂直旋转横梁 / 挡板（重力反向）以缓冲器数量、循环次数、挡板重量、宽度、厚度、角速度、扭矩、安装半径、旋转角度、起点对应垂直线角度为核心条件。",
      "使用等效半径 0.289 * sqrt(4 * A^2 + B^2) 计算动能。",
      "做功能量按 ((T - 9.8 * W * 等效半径 * sin(θ - φ)) / Rs) * 关键行程参数 / n 计算。",
    ],
    "rotary-horizontal-table": [
      "水平旋转工作台以缓冲器数量、循环次数、工作台重量、负荷重量(W1)、旋转半径、旋转台直径、角速度、扭矩、安装半径为核心条件。",
      "动能项按 (((0.707 * (d / 2))^2 * 工作台重量) + (负荷重量 * K^2)) * 0.5 * ω / n 计算。",
      "做功能量按 (T / Rs) * 关键行程参数 / n 计算。",
    ],
  };

  const source = locale === "zh-cn" ? chinese : english;
  return source[variantKey] ?? [];
}

function localizeExplanations(
  variantKey: string,
  normalizedInput: Record<string, unknown>,
  calculation: CalculatorResult,
  locale: Locale,
) {
  const input = normalizedInput as Record<string, number>;

  if (locale === "zh-cn") {
    switch (variantKey) {
      case "linear-free-horizontal":
        return [
          `冲击物体重量 ${formatNumber(input.impactObjectWeightKg)} kg、速度 ${formatNumber(input.speedMs)} m/s 时，单支缓冲器承担的动能约为 ${formatNumber(calculation.absorbedEnergyPerCycleNm)} Nm。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该计算路径使用固定关键行程参数 ${formatNumber(calculation.requiredStrokeMm)} mm，推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-free-slope":
        return [
          `冲击物体重量 ${formatNumber(input.impactObjectWeightKg)} kg、高度 ${formatNumber(input.heightM)} m、斜角 ${formatNumber(input.slopeAngleDeg)} deg 会共同决定动能与做功能量。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该计算路径使用固定关键行程参数 ${formatNumber(calculation.requiredStrokeMm)} mm，推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-free-vertical-drop":
        return [
          `冲击物体重量 ${formatNumber(input.impactObjectWeightKg)} kg、自高度 ${formatNumber(input.heightM)} m 自由落下时，会形成动能与做功能量。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该工况的推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-force-horizontal":
        return [
          `推进力 ${formatNumber(input.pushForceN)} N 会通过固定关键行程参数叠加到总能量中。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该工况的推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-force-vertical-assisting":
      case "linear-force-vertical-opposing":
        return [
          `推进力 ${formatNumber(input.pushForceN)} N 会与垂直方向的重力项一起参与做功能量计算。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该工况的推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-motor-horizontal":
        return [
          `电机功率 ${formatNumber(input.motorPowerKw)} kW 和速度 ${formatNumber(input.speedMs)} m/s 会共同决定做功能量与推进力。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该工况的推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-motor-vertical-assisting":
      case "linear-motor-vertical-opposing":
        return [
          `电机功率 ${formatNumber(input.motorPowerKw)} kW 和速度 ${formatNumber(input.speedMs)} m/s 会与垂直方向的重力项一起参与做功能量计算。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该工况的推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-cylinder-horizontal":
        return [
          `${formatNumber(input.propulsionCylinderCount)} 个推进气缸、${formatNumber(input.cylinderInnerDiameterMm)} mm 内径、${formatNumber(input.cylinderWorkPressureBar)} bar 工作压力会共同决定推进力。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该工况的推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "linear-cylinder-vertical-assisting":
      case "linear-cylinder-vertical-opposing":
        return [
          `${formatNumber(input.propulsionCylinderCount)} 个推进气缸、${formatNumber(input.cylinderInnerDiameterMm)} mm 内径、${formatNumber(input.cylinderWorkPressureBar)} bar 工作压力会与重力项一起参与做功能量计算。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm、每小时总能量为 ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm。`,
          `该工况的推进力结果为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "rotary-horizontal-load":
        return [
          `负荷重量 ${formatNumber(input.loadWeightKg)} kg、旋转半径 ${formatNumber(input.rotationRadiusM)} m、角速度 ${formatNumber(input.angularSpeedRadS)} rad/s 时，单支缓冲器承担的动能约为 ${formatNumber(calculation.absorbedEnergyPerCycleNm)} Nm。`,
          `扭矩 ${formatNumber(input.torqueNm)} Nm 与安装半径 ${formatNumber(input.installationRadiusM)} m 会共同决定做功能量与推进力。`,
          `当前推荐的单次总能量下限为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm，推进力约为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "rotary-vertical-load-assisting":
      case "rotary-vertical-load-opposing":
        return [
          `负荷重量 ${formatNumber(input.loadWeightKg)} kg、旋转半径 ${formatNumber(input.rotationRadiusM)} m、角速度 ${formatNumber(input.angularSpeedRadS)} rad/s 会共同决定动能。`,
          `扭矩 ${formatNumber(input.torqueNm)} Nm、安装半径 ${formatNumber(input.installationRadiusM)} m 与角度关系会共同决定做功能量。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm，推进力约为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "rotary-horizontal-beam-or-gate":
      case "rotary-vertical-beam-or-gate-assisting":
      case "rotary-vertical-beam-or-gate-opposing":
        return [
          variantKey === "rotary-horizontal-beam-or-gate"
            ? `横梁重量 ${formatNumber(input.beamWeightKg)} kg、长度 ${formatNumber(input.beamLengthM)} m、厚度 ${formatNumber(input.beamThicknessM)} m 会共同决定等效半径与动能。`
            : `挡板重量 ${formatNumber(input.gateWeightKg)} kg、宽度 ${formatNumber(input.gateWidthM)} m、厚度 ${formatNumber(input.gateThicknessM)} m 会共同决定等效半径与动能。`,
          variantKey === "rotary-horizontal-beam-or-gate"
            ? `扭矩 ${formatNumber(input.torqueNm)} Nm 与安装半径 ${formatNumber(input.installationRadiusM)} m 会共同决定做功能量。`
            : `扭矩 ${formatNumber(input.torqueNm)} Nm、安装半径 ${formatNumber(input.installationRadiusM)} m 与角度关系会共同决定做功能量。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm，推进力约为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      case "rotary-horizontal-table":
        return [
          `工作台重量 ${formatNumber(input.tableWeightKg)} kg、负荷重量(W1) ${formatNumber(input.loadWeightW1Kg)} kg、旋转半径 ${formatNumber(input.rotationRadiusM)} m 和旋转台直径 ${formatNumber(input.tableDiameterM)} m 会共同决定动能。`,
          `扭矩 ${formatNumber(input.torqueNm)} Nm 与安装半径 ${formatNumber(input.installationRadiusM)} m 会共同决定做功能量与推进力。`,
          `当前推荐的单次总能量为 ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm，推进力约为 ${formatNumber(calculation.averageImpactForceN)} N。`,
        ];
      default:
        return [];
    }
  }

  switch (variantKey) {
    case "linear-free-horizontal":
      return [
        `Impact object weight ${formatNumber(input.impactObjectWeightKg)} kg at ${formatNumber(input.speedMs)} m/s creates ${formatNumber(calculation.absorbedEnergyPerCycleNm)} Nm kinetic energy per absorber.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `This sheet uses a fixed critical stroke of ${formatNumber(calculation.requiredStrokeMm)} mm and reports ${formatNumber(calculation.averageImpactForceN)} N thrust.`,
      ];
    case "linear-free-slope":
      return [
        `Impact object weight ${formatNumber(input.impactObjectWeightKg)} kg, height ${formatNumber(input.heightM)} m and slope angle ${formatNumber(input.slopeAngleDeg)} deg define the kinetic and working energy terms.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `This sheet uses a fixed critical stroke of ${formatNumber(calculation.requiredStrokeMm)} mm and reports ${formatNumber(calculation.averageImpactForceN)} N thrust.`,
      ];
    case "linear-free-vertical-drop":
      return [
        `An impact object of ${formatNumber(input.impactObjectWeightKg)} kg dropping from ${formatNumber(input.heightM)} m creates kinetic and working energy terms.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `Reported thrust force is ${formatNumber(calculation.averageImpactForceN)} N.`,
      ];
    case "linear-force-horizontal":
      return [
        `Push force ${formatNumber(input.pushForceN)} N contributes working energy on top of the kinetic term.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `Reported thrust force is ${formatNumber(calculation.averageImpactForceN)} N.`,
      ];
    case "linear-force-vertical-assisting":
    case "linear-force-vertical-opposing":
      return [
        `Push force ${formatNumber(input.pushForceN)} N is combined with the vertical gravity term to build the working-energy result.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `Reported thrust force is ${formatNumber(calculation.averageImpactForceN)} N.`,
      ];
    case "linear-motor-horizontal":
      return [
        `Motor power ${formatNumber(input.motorPowerKw)} kW at ${formatNumber(input.speedMs)} m/s produces thrust and working energy.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `Reported thrust force is ${formatNumber(calculation.averageImpactForceN)} N.`,
      ];
    case "linear-motor-vertical-assisting":
    case "linear-motor-vertical-opposing":
      return [
        `Motor power ${formatNumber(input.motorPowerKw)} kW and speed ${formatNumber(input.speedMs)} m/s are combined with the vertical gravity term to build the working-energy result.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `Reported thrust force is ${formatNumber(calculation.averageImpactForceN)} N.`,
      ];
    case "linear-cylinder-horizontal":
      return [
        `${formatNumber(input.propulsionCylinderCount)} cylinder(s) at ${formatNumber(input.cylinderWorkPressureBar)} bar and ${formatNumber(input.cylinderInnerDiameterMm)} mm inner diameter produce thrust.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `Reported thrust force is ${formatNumber(calculation.averageImpactForceN)} N.`,
      ];
    case "linear-cylinder-vertical-assisting":
    case "linear-cylinder-vertical-opposing":
      return [
        `${formatNumber(input.propulsionCylinderCount)} cylinder(s), ${formatNumber(input.cylinderInnerDiameterMm)} mm inner diameter and ${formatNumber(input.cylinderWorkPressureBar)} bar are combined with gravity to build the working-energy result.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle and ${formatNumber(calculation.requiredEnergyPerHourNm)} Nm per hour.`,
        `Reported thrust force is ${formatNumber(calculation.averageImpactForceN)} N.`,
      ];
    case "rotary-horizontal-load":
      return [
        `A ${formatNumber(input.loadWeightKg)} kg load at ${formatNumber(input.rotationRadiusM)} m rotation radius and ${formatNumber(input.angularSpeedRadS)} rad/s creates ${formatNumber(calculation.absorbedEnergyPerCycleNm)} Nm kinetic energy per absorber.`,
        `Torque ${formatNumber(input.torqueNm)} Nm and installation radius ${formatNumber(input.installationRadiusM)} m determine the working energy and thrust result.`,
        `The recommendation targets ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle with about ${formatNumber(calculation.averageImpactForceN)} N thrust.`,
      ];
    case "rotary-vertical-load-assisting":
    case "rotary-vertical-load-opposing":
      return [
        `Load weight ${formatNumber(input.loadWeightKg)} kg, rotation radius ${formatNumber(input.rotationRadiusM)} m and angular speed ${formatNumber(input.angularSpeedRadS)} rad/s define the kinetic-energy term.`,
        `Torque ${formatNumber(input.torqueNm)} Nm, installation radius ${formatNumber(input.installationRadiusM)} m and the angle relation build the working-energy term.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle with ${formatNumber(calculation.averageImpactForceN)} N thrust.`,
      ];
    case "rotary-horizontal-beam-or-gate":
    case "rotary-vertical-beam-or-gate-assisting":
    case "rotary-vertical-beam-or-gate-opposing":
      return [
        variantKey === "rotary-horizontal-beam-or-gate"
          ? `Beam weight ${formatNumber(input.beamWeightKg)} kg, length ${formatNumber(input.beamLengthM)} m and thickness ${formatNumber(input.beamThicknessM)} m define the equivalent-radius term.`
          : `Gate weight ${formatNumber(input.gateWeightKg)} kg, width ${formatNumber(input.gateWidthM)} m and thickness ${formatNumber(input.gateThicknessM)} m define the equivalent-radius term.`,
        variantKey === "rotary-horizontal-beam-or-gate"
          ? `Torque ${formatNumber(input.torqueNm)} Nm and installation radius ${formatNumber(input.installationRadiusM)} m determine the working-energy term.`
          : `Torque ${formatNumber(input.torqueNm)} Nm, installation radius ${formatNumber(input.installationRadiusM)} m and the angle relation determine the working-energy term.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle with ${formatNumber(calculation.averageImpactForceN)} N thrust.`,
      ];
    case "rotary-horizontal-table":
      return [
        `Table weight ${formatNumber(input.tableWeightKg)} kg, load weight (W1) ${formatNumber(input.loadWeightW1Kg)} kg, rotation radius ${formatNumber(input.rotationRadiusM)} m and table diameter ${formatNumber(input.tableDiameterM)} m define the kinetic-energy term.`,
        `Torque ${formatNumber(input.torqueNm)} Nm and installation radius ${formatNumber(input.installationRadiusM)} m determine the working-energy and thrust terms.`,
        `The total energy is ${formatNumber(calculation.requiredEnergyPerCycleNm)} Nm per cycle with ${formatNumber(calculation.averageImpactForceN)} N thrust.`,
      ];
    default:
      return [];
  }
}

export function localizeCalculateResponse(
  result: CalculateResponse,
  locale: Locale,
): CalculateResponse {
  return {
    ...result,
    calculation: {
      ...result.calculation,
      assumptions: localizeAssumptions(result.variantKey, locale),
    },
    explanations: [
      ...localizeExplanations(
        result.variantKey,
        result.normalizedInput as Record<string, unknown>,
        result.calculation,
        locale,
      ),
      ...localizeAssumptions(result.variantKey, locale),
    ],
  };
}
