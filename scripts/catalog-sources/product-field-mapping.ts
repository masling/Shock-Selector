import { z } from "zod";
import { modelKey } from "./asset-remarks.mjs";

export type FieldDefinition = { key: string; sourceHeader: string; labelEn: string; unit: string | null; dataType: "NUMBER" | "TEXT" | "RANGE" };
const compact = (value: string) => value.normalize("NFKC").replace(/\s+/g, "");
export const productFieldDefinitions: FieldDefinition[] = [
  { key: "strokeMm", sourceHeader: "缓冲行程mm", labelEn: "Stroke", unit: "mm", dataType: "NUMBER" },
  { key: "optimalVelocityRange", sourceHeader: "最佳速度范围m/s", labelEn: "Optimal velocity range", unit: "m/s", dataType: "RANGE" },
  { key: "energyPerCycleNm", sourceHeader: "每次最大吸收能量Nm", labelEn: "Energy per cycle", unit: "Nm/C", dataType: "NUMBER" },
  { key: "energyPerHourNm", sourceHeader: "每小时吸收能量Nm/hr", labelEn: "Energy per hour", unit: "Nm/h", dataType: "NUMBER" },
  { key: "maxImpactForceN", sourceHeader: "最大冲击力N", labelEn: "Max impact force", unit: "N", dataType: "NUMBER" },
  { key: "maxThrustForceN", sourceHeader: "最大推进力N", labelEn: "Max thrust force", unit: "N", dataType: "NUMBER" },
  { key: "threadSize", sourceHeader: "安装螺纹", labelEn: "Mounting thread", unit: null, dataType: "TEXT" },
  ...(["X", "Y", "Z"] as const).flatMap(axis => [
    { key: `staticStiffness${axis}NPerMm`, sourceHeader: `${axis}静刚度N/mm`, labelEn: `${axis} static stiffness`, unit: "N/mm", dataType: "NUMBER" as const },
    { key: `naturalFrequency${axis}Hz`, sourceHeader: `${axis}固有频率Hz`, labelEn: `${axis} natural frequency`, unit: "Hz", dataType: "RANGE" as const },
    { key: `shockStiffness${axis}NPerMm`, sourceHeader: `${axis}冲击刚度N/mm`, labelEn: `${axis} shock stiffness`, unit: "N/mm", dataType: "NUMBER" as const },
    { key: `maxDeflection${axis}Mm`, sourceHeader: `${axis}最大允许变形mm`, labelEn: `${axis} maximum allowed deflection`, unit: "mm", dataType: "NUMBER" as const },
    { key: `ratedDeflection${axis}Mm`, sourceHeader: `${axis}额定载荷下变形mm`, labelEn: `${axis} deflection at rated load`, unit: "mm", dataType: "RANGE" as const },
    { key: `ratedLoad${axis}N`, sourceHeader: `${axis}额定载荷N`, labelEn: `${axis} rated load`, unit: "N", dataType: "NUMBER" as const },
  ]),
  { key: "dampingRatio", sourceHeader: "阻尼比C/Cc", labelEn: "Damping ratio", unit: "C/Cc", dataType: "RANGE" },
];
const byHeader = new Map(productFieldDefinitions.map(field => [compact(field.sourceHeader), field]));

export type ParsedValue = {
  rawValue: string;
  state: "valid" | "missing" | "placeholder" | "invalid";
  valueNumber: number | null;
  valueText: string | null;
  valueJson: Record<string, unknown> | null;
};

const evidenceCorrections: Record<string, { value: unknown; evidence: string }> = {
  "OVTW24-70-10|maxDeflectionXMm|L143|21.+": {
    value: 21.8,
    evidence: "Vibration Isolator 2024.pdf, OVTW24 technical data: Shear/Roll max deflection 21.8 mm; matching Y-axis value is 21.8 mm",
  },
};
export function parseEngineeringValue(value: unknown, dataType: FieldDefinition["dataType"]): ParsedValue {
  const rawValue = value == null ? "" : String(value).trim();
  const result: ParsedValue = { rawValue, state: "missing", valueNumber: null, valueText: null, valueJson: null };
  if (!rawValue || /^[—–-]$/.test(rawValue)) return result;
  if (/待定|待确认|^TBD$|^N\/?A$/i.test(rawValue)) return { ...result, state: "placeholder", valueText: rawValue };
  if (dataType === "TEXT") return { ...result, state: "valid", valueText: rawValue };
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return { ...result, state: "valid", valueNumber: value };
  const text = compact(rawValue);
  const number = "(?:\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?|\\.\\d+)";
  const numeric = (token: string) => Number(token.replace(/,/g, ""));
  const finite = (token: string) => Number.isFinite(numeric(token));
  if (new RegExp(`^${number}$`).test(text)) {
    const parsed = numeric(text);
    if (Number.isFinite(parsed)) return { ...result, state: "valid", valueNumber: parsed };
  }
  if (dataType === "RANGE") {
    const range = new RegExp(`^(${number})[-~～–—](${number})$`).exec(text);
    if (range && finite(range[1]) && finite(range[2]) && numeric(range[1]) <= numeric(range[2])) return { ...result, state: "valid", valueText: rawValue, valueJson: { kind: "range", min: numeric(range[1]), max: numeric(range[2]) } };
    const tolerance = new RegExp(`^(${number})±(${number})$`).exec(text);
    if (tolerance && finite(tolerance[1]) && finite(tolerance[2]) && numeric(tolerance[1]) >= numeric(tolerance[2]) && Number.isFinite(numeric(tolerance[1]) + numeric(tolerance[2]))) {
      const nominal = numeric(tolerance[1]), delta = numeric(tolerance[2]);
      return { ...result, state: "valid", valueText: rawValue, valueJson: { kind: "tolerance", nominal, minus: delta, plus: delta, min: Number((nominal - delta).toPrecision(15)), max: Number((nominal + delta).toPrecision(15)) } };
    }
    const bound = new RegExp(`^(>=|<=|≥|≤|>|<)(${number})$`).exec(text);
    if (bound && finite(bound[2])) return { ...result, state: "valid", valueText: rawValue, valueJson: { kind: "bound", operator: ({ ">=": "gte", "≥": "gte", "<=": "lte", "≤": "lte", ">": "gt", "<": "lt" } as Record<string, string>)[bound[1]], bound: numeric(bound[2]) } };
  }
  return { ...result, state: "invalid", valueText: rawValue };
}

const rowSchema = z.object({
  model: z.string().trim().min(1), rawModel: z.string().trim().min(1), kind: z.enum(["absorber", "isolator"]),
  source: z.object({ file: z.string().min(1), sheet: z.string().min(1), row: z.number().int().positive(), modelCell: z.string().min(1) }),
  specs: z.array(z.object({ label: z.string(), cell: z.string(), value: z.unknown() })),
  sourceSelectorFlag: z.unknown(),
}).passthrough();
export type MappedSpec = ParsedValue & { key: string; unit: string | null; dataType: FieldDefinition["dataType"]; sourceHeader: string; sourceCell: string; correction?: { originalRawValue: string; evidence: string } };
export type MappingIssue = { code: string; model: string | null; field?: string; cell?: string; detail?: string };
export type MappedProduct = {
  model: string; rawModel: string; kind: "absorber" | "isolator"; source: z.infer<typeof rowSchema>["source"];
  sourceSeriesCode: string; targetSeriesCodeCandidate: string; entityKind: "source_group" | "source_model";
  sourceSelectorFlag: unknown; runtimeSelectorSupported: boolean;
  catalogStatus: "DRAFT"; selectorEligible: false; selectorStatus: "NOT_APPLICABLE" | "INCOMPLETE";
  specs: MappedSpec[]; unmappedFields: { label: string; cell: string; value: unknown }[]; issues: MappingIssue[];
  implicitDeletesAllowed: false;
};

export function mapProductRow(input: unknown): { row: MappedProduct | null; issues: MappingIssue[] } {
  const parsed = rowSchema.safeParse(input);
  if (!parsed.success) return { row: null, issues: [{ code: "invalid_source_row", model: null, detail: parsed.error.issues.map(issue => issue.path.join(".")).join(", ") }] };
  const raw = parsed.data;
  const model = modelKey(raw.model);
  const sourceSeriesCode = /^(6JX|OVTC|OVTN|OVTS|OVTW|WHG|WH|SH|BE|EA|EKL|EK|EN|ES|EI|ED|HS|E)(?=[\d-])/.exec(model)?.[1] ?? "UNKNOWN";
  const issues: MappingIssue[] = [];
  const specs: MappedSpec[] = [], unmappedFields: MappedProduct["unmappedFields"] = [];
  for (const spec of raw.specs) {
    const field = byHeader.get(compact(spec.label));
    if (!field) { unmappedFields.push(spec); issues.push({ code: "unmapped_field", model, cell: spec.cell, detail: spec.label }); continue; }
    const parsedValue = parseEngineeringValue(spec.value, field.dataType);
    const correction = evidenceCorrections[`${model}|${field.key}|${spec.cell}|${parsedValue.rawValue}`];
    const value = correction ? parseEngineeringValue(correction.value, field.dataType) : parsedValue;
    if (specs.some(existing => existing.key === field.key)) { issues.push({ code: "duplicate_mapped_field", model, field: field.key, cell: spec.cell }); continue; }
    specs.push({ ...value, key: field.key, unit: field.unit, dataType: field.dataType, sourceHeader: spec.label, sourceCell: spec.cell, ...(correction ? { correction: { originalRawValue: parsedValue.rawValue, evidence: correction.evidence } } : {}) });
    if (correction) issues.push({ code: "spec_corrected_from_evidence", model, field: field.key, cell: spec.cell, detail: `${parsedValue.rawValue} -> ${value.rawValue}; ${correction.evidence}` });
    if (value.state !== "valid") issues.push({ code: `spec_${value.state}`, model, field: field.key, cell: spec.cell, detail: value.rawValue });
  }
  const supported = raw.kind === "absorber" && ["EK", "EKL", "EN", "ES", "EI", "ED"].includes(sourceSeriesCode);
  if (supported) for (const key of ["strokeMm", "energyPerCycleNm", "energyPerHourNm", "maxImpactForceN"]) {
    const spec = specs.find(value => value.key === key);
    if (!spec || spec.state !== "valid" || spec.valueNumber === null || spec.valueNumber <= 0) issues.push({ code: "selector_input_not_ready", model, field: key });
  }
  const row: MappedProduct = {
    model, rawModel: raw.rawModel, kind: raw.kind, source: raw.source,
    sourceSeriesCode, targetSeriesCodeCandidate: sourceSeriesCode === "EKL" ? "EK" : sourceSeriesCode,
    entityKind: model.endsWith("(B)") ? "source_group" : "source_model",
    sourceSelectorFlag: raw.sourceSelectorFlag, runtimeSelectorSupported: supported,
    catalogStatus: "DRAFT", selectorEligible: false, selectorStatus: supported ? "INCOMPLETE" : "NOT_APPLICABLE",
    specs, unmappedFields, issues, implicitDeletesAllowed: false,
  };
  return { row, issues };
}
