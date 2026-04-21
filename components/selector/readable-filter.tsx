"use client";

import type { Locale } from "@/lib/i18n/config";

type ReadableFilterProps = {
  filter: Record<string, number | string>;
  locale: Locale;
};

type FieldMapping = {
  label: string;
  labelEn: string;
  operator: string;
  unit: string;
};

const FILTER_FIELD_MAP: Record<string, FieldMapping> = {
  minStrokeMm: { label: "行程", labelEn: "Stroke", operator: "≥", unit: "mm" },
  minEnergyPerCycleNm: { label: "单次能量", labelEn: "Energy/Cycle", operator: "≥", unit: "Nm" },
  minEnergyPerHourNm: { label: "每小时能量", labelEn: "Energy/Hour", operator: "≥", unit: "Nm" },
  minImpactForceN: { label: "冲击力", labelEn: "Impact Force", operator: "≥", unit: "N" },
  minThrustForceN: { label: "推力", labelEn: "Thrust Force", operator: "≥", unit: "N" },
  maxTotalLengthMm: { label: "总长度", labelEn: "Total Length", operator: "≤", unit: "mm" },
  threadSize: { label: "螺纹", labelEn: "Thread", operator: "=", unit: "" },
  familySlug: { label: "产品家族", labelEn: "Family", operator: "=", unit: "" },
};

export function ReadableFilter({ filter, locale }: ReadableFilterProps) {
  const entries = Object.entries(filter);

  if (entries.length === 0) return null;

  const isChinese = locale === "zh-cn";

  return (
    <div className="rounded-xl bg-mist/50 p-4 space-y-2">
      {entries.map(([key, value]) => {
        const mapping = FILTER_FIELD_MAP[key];
        const label = mapping
          ? (isChinese ? mapping.label : mapping.labelEn)
          : key;
        const operator = mapping?.operator ?? "=";
        const unit = mapping?.unit ?? "";

        return (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span className="text-steel">{label}</span>
            <span className="text-ink font-medium">{operator}</span>
            <span className="text-ink font-medium">{value}</span>
            {unit && <span className="text-steel/70">{unit}</span>}
          </div>
        );
      })}
    </div>
  );
}
