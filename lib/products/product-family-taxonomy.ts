import type { ProductFamily } from "@/lib/content/site";

export type ProductFamilySlug = ProductFamily["slug"];

type ProductFamilyCandidate = {
  model: string | null | undefined;
  type: string | null | undefined;
};

type ProductFamilyRule = {
  slug: ProductFamilySlug;
  modelPrefixes?: string[];
  typeKeywords?: string[];
};

const productFamilyRules: ProductFamilyRule[] = [
  {
    slug: "adjustable-shock-absorbers",
    modelPrefixes: ["EKL", "EK"],
    typeKeywords: ["可调", "adjustable"],
  },
  {
    slug: "heavy-duty-shock-absorbers",
    modelPrefixes: ["ED"],
    typeKeywords: ["heavy duty", "heavy-duty"],
  },
  {
    slug: "heavy-industry-buffers",
    modelPrefixes: ["EI"],
    typeKeywords: ["buffer", "buffers"],
  },
  {
    slug: "super-long-life-shock-absorbers",
    modelPrefixes: ["ES"],
    typeKeywords: ["super long life", "long life", "long-life"],
  },
  {
    slug: "wire-rope-vibration-isolators",
    typeKeywords: ["wire rope", "vibration isolator", "isolator"],
  },
  {
    slug: "non-adjustable-shock-absorbers",
    modelPrefixes: ["EN"],
    typeKeywords: ["固定", "non-adjustable", "non adjustable", "self-compensating"],
  },
];

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function extractModelPrefix(model: string | null | undefined) {
  return ((model ?? "").trim().toUpperCase().match(/^[A-Z]+/) ?? [""])[0];
}

function matchesRule(candidate: ProductFamilyCandidate, rule: ProductFamilyRule) {
  const normalizedType = normalizeText(candidate.type);
  const modelPrefix = extractModelPrefix(candidate.model);

  const prefixMatched = rule.modelPrefixes?.some((prefix) => modelPrefix.startsWith(prefix)) ?? false;
  const typeMatched =
    rule.typeKeywords?.some((keyword) => normalizedType.includes(keyword.toLowerCase())) ?? false;

  return prefixMatched || typeMatched;
}

export function resolveProductFamilySlug(
  candidate: ProductFamilyCandidate,
): ProductFamilySlug | null {
  const matchedRule = productFamilyRules.find((rule) => matchesRule(candidate, rule));

  if (matchedRule) {
    return matchedRule.slug;
  }

  const normalizedType = normalizeText(candidate.type);

  if (normalizedType.includes("固定")) {
    return "non-adjustable-shock-absorbers";
  }

  if (normalizedType.includes("可调")) {
    return "adjustable-shock-absorbers";
  }

  return null;
}
