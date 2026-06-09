export type CatalogSpecSeed = {
  key: string;
  labelEn: string;
  labelZh: string;
  unit?: string;
  dataType: "NUMBER" | "TEXT" | "RANGE" | "JSON";
  filterable: boolean;
  comparable: boolean;
  requiredForSelector?: boolean;
  sortOrder: number;
  seriesCodes?: string[];
};

export const catalogSpecSeeds: CatalogSpecSeed[] = [
  { key: "strokeMm", labelEn: "Stroke", labelZh: "缓冲行程", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 10, seriesCodes: ["EK", "EKL", "EN", "ES", "EI", "ED"] },
  { key: "optimalVelocityRange", labelEn: "Optimal velocity range", labelZh: "最佳速度范围", unit: "m/s", dataType: "RANGE", filterable: false, comparable: true, sortOrder: 20, seriesCodes: ["EK", "EKL", "EN", "ES"] },
  { key: "energyPerCycleNm", labelEn: "Max energy per cycle", labelZh: "每次最大吸收能量", unit: "Nm/C", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 30, seriesCodes: ["EK", "EKL", "EN", "ES", "EI", "ED"] },
  { key: "energyPerHourNm", labelEn: "Max energy per hour", labelZh: "每小时最大吸收能量", unit: "Nm/h", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 40, seriesCodes: ["EK", "EKL", "EN", "ES", "ED"] },
  { key: "maxImpactForceN", labelEn: "Max impact force", labelZh: "最大冲击力", unit: "N", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 50, seriesCodes: ["EK", "EKL", "EN", "ES", "EI", "ED"] },
  { key: "maxThrustForceN", labelEn: "Max thrust force", labelZh: "最大推进力", unit: "N", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 60, seriesCodes: ["EK", "EKL", "EN", "ES"] },
  { key: "totalLengthMm", labelEn: "Total length", labelZh: "总长度", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 70, seriesCodes: ["EK", "EKL", "EN", "ES", "ED"] },
  { key: "threadSize", labelEn: "Thread size", labelZh: "螺纹尺寸", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 80, seriesCodes: ["EK", "EKL", "EN", "ES"] },
  { key: "weight", labelEn: "Weight", labelZh: "重量", unit: "kg/g", dataType: "TEXT", filterable: false, comparable: true, sortOrder: 90 },
  { key: "maxStaticLoadN", labelEn: "Max static load", labelZh: "最大静载", unit: "N", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 100, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "vibrationStiffnessNPerM", labelEn: "Vibration stiffness", labelZh: "振动刚度", unit: "N/m", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 110, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "shockStiffnessNPerM", labelEn: "Shock stiffness", labelZh: "冲击刚度", unit: "N/m", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 120, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "maxDeflectionMm", labelEn: "Max deflection", labelZh: "最大变形", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 130, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "mountingOption", labelEn: "Mounting option", labelZh: "安装方式", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 140, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "loopCount", labelEn: "Loop count", labelZh: "圈数", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 150, seriesCodes: ["WR", "CR"] },
  { key: "nominalDiameterDn", labelEn: "Nominal diameter", labelZh: "公称通径", unit: "DN", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 160, seriesCodes: ["JYXR_P", "JYXR_H"] },
  { key: "flangeOuterDiameterMm", labelEn: "Flange outer diameter", labelZh: "法兰外径", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 170, seriesCodes: ["JYXR_P", "JYXR_H"] },
  { key: "boltHolePattern", labelEn: "Bolt-hole pattern", labelZh: "螺栓孔", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 180, seriesCodes: ["JYXR_P", "JYXR_H"] },
  { key: "interfaceStandard", labelEn: "Interface standard", labelZh: "接口标准", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 190, seriesCodes: ["JYXR_P", "JYXR_H"] },
];

export const absorberSelectorSpecKeys = catalogSpecSeeds
  .filter((spec) => spec.requiredForSelector)
  .map((spec) => spec.key);
