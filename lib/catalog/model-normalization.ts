export type ParsedCatalogValue = {
  valueNumber: number | null;
  valueText: string | null;
  rawValue: string;
};

export function normalizeModelName(input: string) {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(");
}

export function detectSeriesCode(model: string) {
  const normalized = normalizeModelName(model).toUpperCase();

  if (normalized.startsWith("JYXR(P)")) return "JYXR_P";
  if (normalized.startsWith("JYXR(H)")) return "JYXR_H";
  if (normalized.startsWith("HGGN")) return "HGGN";
  if (normalized.startsWith("HGGS")) return "HGGS";
  if (normalized.startsWith("EKL")) return "EKL";

  const match = normalized.match(/^[A-Z]+/);
  return match?.[0] ?? "UNKNOWN";
}

export function parseDecimalText(input: unknown) {
  if (typeof input === "number") return input;
  if (input === null || input === undefined) return null;

  const text = String(input).trim();
  if (!text || text === "–" || text === "-") return null;
  if (/\d\s*-\s*\d/.test(text)) return null;

  const parsed = Number(text.replace(/,/g, "").replace(/\s+/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseCatalogNumber(input: unknown): ParsedCatalogValue {
  const rawValue = input === null || input === undefined ? "" : String(input).trim();
  const valueNumber = parseDecimalText(input);

  return {
    valueNumber,
    valueText: valueNumber === null && rawValue ? rawValue : null,
    rawValue,
  };
}

function padNumber(value: string) {
  return value.padStart(6, "0");
}

export function sortKeyForModel(model: string) {
  const normalized = normalizeModelName(model).toUpperCase();
  const series = detectSeriesCode(normalized);
  const numbers = normalized.match(/\d+/g) ?? [];
  return [series, ...numbers.map(padNumber), normalized].join("|");
}
