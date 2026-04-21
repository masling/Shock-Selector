import { productFamilies } from "@/lib/content/site";
import type { Locale } from "@/lib/i18n/config";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";

export type ProductTypeCodeValue =
  | "ADJUSTABLE"
  | "NON_ADJUSTABLE"
  | "HEAVY_DUTY"
  | "BUFFER"
  | "ISOLATOR"
  | "SPECIALTY";

type TranslationSeed = {
  name: string;
  tag?: string;
  summary: string;
  description: string;
};

export type CanonicalProductFamilySeed = {
  key: string;
  slug: ProductFamilySlug;
  typeCode: ProductTypeCodeValue;
  seriesCodes: string[];
  legacyPageId?: string;
  legacyCatalogTitles: string[];
  translations: Record<"en" | "zh-cn", TranslationSeed>;
};

type FamilyOverride = Pick<
  CanonicalProductFamilySeed,
  "key" | "typeCode" | "seriesCodes" | "legacyPageId" | "legacyCatalogTitles" | "translations"
>;

const overrides: Partial<Record<ProductFamilySlug, FamilyOverride>> = {
  "adjustable-shock-absorbers": {
    key: "adjustable_shock_absorbers",
    typeCode: "ADJUSTABLE",
    seriesCodes: ["EK", "EKL"],
    legacyPageId: "36",
    legacyCatalogTitles: ["缓冲器"],
    translations: {
      en: {
        name: "Adjustable Shock Absorbers",
        tag: "Tunable deceleration",
        summary:
          "Adjustable hydraulic shock absorbers for applications where payload, speed or mounting conditions vary.",
        description:
          "Use this family when machine conditions change and damping needs to be tuned instead of fixed at one setting.",
      },
      "zh-cn": {
        name: "可调式缓冲器",
        tag: "可调减速",
        summary: "适用于负载、速度或安装条件会变化的设备工况，可通过调节阻尼来优化减速过程。",
        description: "当工况会变化、需要通过旋钮或参数调节阻尼时，优先使用这一家族。",
      },
    },
  },
  "non-adjustable-shock-absorbers": {
    key: "non_adjustable_shock_absorbers",
    typeCode: "NON_ADJUSTABLE",
    seriesCodes: ["EN"],
    legacyPageId: "30",
    legacyCatalogTitles: ["缓冲器"],
    translations: {
      en: {
        name: "Non-adjustable Shock Absorbers",
        tag: "Fast deployment",
        summary:
          "Self-compensating shock absorbers for repeatable machine motion where dependable daily operation matters more than on-site tuning.",
        description:
          "Use this family for standardized machine stops and repeatable end-stop conditions where installation speed and consistency are priorities.",
      },
      "zh-cn": {
        name: "自补偿 / 不可调缓冲器",
        tag: "快速选型",
        summary: "适用于重复性高的设备运动场景，重点是安装简便、运行稳定，而不是现场手动调节。",
        description: "当工况稳定、希望快速安装并获得一致减速表现时，优先使用这一家族。",
      },
    },
  },
  "super-long-life-shock-absorbers": {
    key: "super_long_life_shock_absorbers",
    typeCode: "NON_ADJUSTABLE",
    seriesCodes: ["ES"],
    legacyPageId: "29",
    legacyCatalogTitles: ["缓冲器"],
    translations: {
      en: {
        name: "Super Long Life Shock Absorbers",
        tag: "High cycle life",
        summary:
          "Long-life hydraulic shock absorbers for high-frequency equipment where uptime and repeatability directly affect output.",
        description:
          "Use this family for packaging and fast-cycle machine environments where service interval planning and repeatability are key.",
      },
      "zh-cn": {
        name: "超长寿命缓冲器",
        tag: "高循环寿命",
        summary: "面向高频运行设备，强调寿命、重复一致性和维护周期可控，适合持续产线工况。",
        description: "当高频循环、连续运行和寿命表现比一次性高能量更重要时，优先使用这一家族。",
      },
    },
  },
  "heavy-duty-shock-absorbers": {
    key: "heavy_duty_shock_absorbers",
    typeCode: "HEAVY_DUTY",
    seriesCodes: ["ED"],
    legacyPageId: "34",
    legacyCatalogTitles: ["重型缓冲器"],
    translations: {
      en: {
        name: "Heavy Duty Shock Absorbers",
        tag: "Extreme-duty protection",
        summary:
          "Heavy-duty hydraulic shock absorbers for crane travel, rail systems, stacker cranes and other severe impact conditions.",
        description:
          "Use this family when impact energy is safety-critical and the application needs stronger stopping protection than standard automation absorbers.",
      },
      "zh-cn": {
        name: "重载缓冲器",
        tag: "重载防护",
        summary: "面向起重、轨道、堆垛机等高冲击场景，强调大能量吸收和安全性优先的终端防护。",
        description: "当设备存在大冲击、高安全要求或重载终端保护需求时，优先使用这一家族。",
      },
    },
  },
  "heavy-industry-buffers": {
    key: "heavy_industry_buffers",
    typeCode: "BUFFER",
    seriesCodes: ["EI"],
    legacyPageId: "32",
    legacyCatalogTitles: ["重工业缓冲器"],
    translations: {
      en: {
        name: "Heavy Industry Buffers",
        tag: "Large-scale impact control",
        summary:
          "Hydraulic buffer lines for large machines and transported structures where mass, stopping envelope and ruggedness are the first design constraints.",
        description:
          "Use this family for large moving masses and heavy machine end stops where protection-first design matters more than compact tuning.",
      },
      "zh-cn": {
        name: "重工业液压缓冲器",
        tag: "大质量冲击控制",
        summary: "适用于大型设备和重载移动结构，重点考虑停止包络、运动质量和整体耐用性。",
        description: "当设备质量大、冲击包络大、并且需要更强防护时，优先使用这一家族。",
      },
    },
  },
  "wire-rope-vibration-isolators": {
    key: "wire_rope_vibration_isolators",
    typeCode: "ISOLATOR",
    seriesCodes: [],
    legacyPageId: "28",
    legacyCatalogTitles: ["钢绳隔振器"],
    translations: {
      en: {
        name: "Wire Rope Vibration Isolators",
        tag: "Multi-axis isolation",
        summary:
          "Wire rope isolators for equipment protection where shock resistance, vibration isolation and corrosion resistance need to work together.",
        description:
          "Use this family when equipment needs multi-axis isolation in transport, marine or harsh-environment conditions.",
      },
      "zh-cn": {
        name: "钢丝绳隔振器",
        tag: "多方向隔振",
        summary: "适用于同时关注抗冲击、隔振和耐腐蚀的设备保护场景，尤其适合复杂环境。",
        description: "当设备面临多方向扰动、冲击与振动并存时，优先使用这一家族。",
      },
    },
  },
  "anti-impact-compound-vibration-isolators": {
    key: "anti_impact_compound_vibration_isolators",
    typeCode: "ISOLATOR",
    seriesCodes: [],
    legacyPageId: "33",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "Anti-Impact Compound Vibration Isolators",
        summary:
          "Compound isolator family for applications that need combined vibration isolation and impact resistance.",
        description:
          "Use this family for more demanding vibration-isolation conditions where compound structures are preferable to standard isolator formats.",
      },
      "zh-cn": {
        name: "复合抗冲击隔振器",
        summary: "适用于同时关注隔振与抗冲击能力的复杂设备场景。",
        description: "当标准隔振器不足以覆盖冲击与隔振的复合需求时，可优先评估这一家族。",
      },
    },
  },
  "all-metal-equal-stiffness-vibration-isolators": {
    key: "all_metal_equal_stiffness_vibration_isolators",
    typeCode: "ISOLATOR",
    seriesCodes: [],
    legacyPageId: "31",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "All-Metal Equal-Stiffness Vibration Isolators",
        summary:
          "All-metal vibration isolators for high-load and harsh-environment equipment mounting.",
        description:
          "Use this family when metal construction, long service life and resistance to harsh conditions are more important than compact commercial isolator packaging.",
      },
      "zh-cn": {
        name: "全金属等刚度隔振器",
        summary: "面向高载荷和复杂环境安装需求的全金属隔振产品。",
        description: "当工况强调金属结构寿命、耐环境性和载荷能力时，可优先评估这一家族。",
      },
    },
  },
  "steel-mesh-pad-rubber-vibration-isolators": {
    key: "steel_mesh_pad_rubber_vibration_isolators",
    typeCode: "ISOLATOR",
    seriesCodes: [],
    legacyPageId: "26",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "Steel Mesh Pad & Rubber Vibration Isolators",
        summary:
          "Mixed-material isolation family covering steel mesh pad, rubber and related equipment-isolation products.",
        description:
          "Use this family when the application needs broader isolation formats than wire rope products alone.",
      },
      "zh-cn": {
        name: "钢丝网垫与橡胶隔振器",
        summary: "覆盖钢丝网垫、橡胶等多种材料形态的隔振产品家族。",
        description: "当设备需要更丰富的隔振材料和结构形式时，可优先评估这一家族。",
      },
    },
  },
  "special-vibration-isolators": {
    key: "special_vibration_isolators",
    typeCode: "ISOLATOR",
    seriesCodes: [],
    legacyPageId: "27",
    legacyCatalogTitles: ["特种隔振器"],
    translations: {
      en: {
        name: "Special Vibration Isolators",
        summary:
          "Special vibration-control products for critical applications and stricter isolation requirements.",
        description:
          "Use this family for special-market and higher-requirement vibration isolation projects where standard isolators are not sufficient.",
      },
      "zh-cn": {
        name: "特种隔振器",
        summary: "面向特殊应用和更严格隔振要求的专项产品家族。",
        description: "当设备存在更严苛的隔振、抗冲击或认证要求时，可优先评估这一家族。",
      },
    },
  },
  "fluid-viscous-dampers": {
    key: "fluid_viscous_dampers",
    typeCode: "SPECIALTY",
    seriesCodes: [],
    legacyPageId: "25",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "Fluid Viscous Dampers",
        summary:
          "Viscous damping products for structural and heavy-duty energy management applications.",
        description:
          "Use this family for engineering projects whose buying logic differs from machine end-stop shock absorbers.",
      },
      "zh-cn": {
        name: "黏滞阻尼器",
        summary: "面向结构和重载能量管理项目的专项阻尼产品。",
        description: "当项目属于结构减振或专项工程场景时，可优先评估这一家族。",
      },
    },
  },
  "tuned-mass-damper-systems": {
    key: "tuned_mass_damper_systems",
    typeCode: "SPECIALTY",
    seriesCodes: [],
    legacyPageId: "24",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "Tuned Mass Damper Systems",
        summary:
          "Tuned mass damping systems for structures and specialized vibration-control projects.",
        description:
          "Use this family for structural and custom energy-management projects instead of standard machine product selection.",
      },
      "zh-cn": {
        name: "调谐质量阻尼系统",
        summary: "面向结构振动控制与专项能量管理项目的系统类产品。",
        description: "当项目是结构类或定制类减振工程时，可优先评估这一家族。",
      },
    },
  },
  "particle-dampers": {
    key: "particle_dampers",
    typeCode: "SPECIALTY",
    seriesCodes: [],
    legacyPageId: "23",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "Particle Dampers",
        summary:
          "Specialty particle damping products for custom vibration and energy-dissipation projects.",
        description:
          "Use this family for specialized damping requirements rather than standard shock absorber sizing.",
      },
      "zh-cn": {
        name: "颗粒阻尼器",
        summary: "面向专项减振和耗能场景的颗粒阻尼产品。",
        description: "当项目是定制化专项减振需求时，可优先评估这一家族。",
      },
    },
  },
  "friction-spring-dampers": {
    key: "friction_spring_dampers",
    typeCode: "SPECIALTY",
    seriesCodes: [],
    legacyPageId: "20",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "Friction Spring Dampers",
        summary:
          "All-metal friction spring dampers for harsh environments and structural damping projects.",
        description:
          "Use this family when environmental resistance and friction-based damping are core project constraints.",
      },
      "zh-cn": {
        name: "摩擦弹簧阻尼器",
        summary: "面向严苛环境和专项工程的全金属摩擦阻尼产品。",
        description: "当工况强调环境适应性和摩擦式耗能能力时，可优先评估这一家族。",
      },
    },
  },
  "locking-assemblies-and-couplings": {
    key: "locking_assemblies_and_couplings",
    typeCode: "SPECIALTY",
    seriesCodes: [],
    legacyPageId: "19",
    legacyCatalogTitles: [],
    translations: {
      en: {
        name: "Locking Assemblies & Couplings",
        summary:
          "Auxiliary mechanical transmission components that sit beside the core damping and isolation product lines.",
        description:
          "Use this family for locking assemblies and couplings when the buying path extends beyond damping products.",
      },
      "zh-cn": {
        name: "锁紧套与联轴器",
        summary: "位于阻尼与隔振产品之外的辅助机械传动部件。",
        description: "当采购需求扩展到机械传动配件时，可优先评估这一家族。",
      },
    },
  },
};

export const canonicalProductFamilySeeds: CanonicalProductFamilySeed[] = productFamilies.map((family) => {
  const override = overrides[family.slug];

  if (!override) {
    return {
      key: family.slug.replace(/-/g, "_"),
      slug: family.slug,
      typeCode: "SPECIALTY",
      seriesCodes: [],
      legacyCatalogTitles: [],
      translations: {
        en: {
          name: family.name,
          tag: family.tag,
          summary: family.summary,
          description: family.summary,
        },
        "zh-cn": {
          name: family.name,
          tag: family.tag,
          summary: family.summary,
          description: family.summary,
        },
      },
    };
  }

  return {
    key: override.key,
    slug: family.slug,
    typeCode: override.typeCode,
    seriesCodes: override.seriesCodes,
    legacyPageId: override.legacyPageId,
    legacyCatalogTitles: override.legacyCatalogTitles,
    translations: override.translations,
  };
});

const seedBySlug = new Map(canonicalProductFamilySeeds.map((seed) => [seed.slug, seed]));
const seedBySeriesCode = new Map<string, CanonicalProductFamilySeed>();

for (const seed of canonicalProductFamilySeeds) {
  for (const seriesCode of seed.seriesCodes) {
    seedBySeriesCode.set(seriesCode, seed);
  }
}

export function getCanonicalProductFamilySeedBySlug(slug: string) {
  return seedBySlug.get(slug as ProductFamilySlug) ?? null;
}

function resolveSeedLocale(locale: Locale): "en" | "zh-cn" {
  return locale === "zh-cn" ? "zh-cn" : "en";
}

export function getLocalizedCanonicalFamilySeedTranslation(
  locale: Locale,
  slug: string | null | undefined,
) {
  const seed = slug ? getCanonicalProductFamilySeedBySlug(slug) : null;

  if (!seed) {
    return null;
  }

  return seed.translations[resolveSeedLocale(locale)];
}

export function getCanonicalProductFamilySeedBySeriesCode(seriesCode: string | null | undefined) {
  if (!seriesCode) {
    return null;
  }

  return seedBySeriesCode.get(seriesCode.trim().toUpperCase()) ?? null;
}

export function extractSeriesCode(model: string | null | undefined) {
  const value = (model ?? "").trim().toUpperCase();
  const match = value.match(/^[A-Z]+/);
  return match ? match[0] : null;
}

export function resolveProductTypeCode(
  model: string | null | undefined,
  legacyTypeLabel: string | null | undefined,
): ProductTypeCodeValue {
  const seed = getCanonicalProductFamilySeedBySeriesCode(extractSeriesCode(model));

  if (seed) {
    return seed.typeCode;
  }

  const normalizedLegacyType = (legacyTypeLabel ?? "").trim().toLowerCase();

  if (normalizedLegacyType.includes("可调") || normalizedLegacyType.includes("adjustable")) {
    return "ADJUSTABLE";
  }

  if (
    normalizedLegacyType.includes("固定") ||
    normalizedLegacyType.includes("non-adjustable") ||
    normalizedLegacyType.includes("non adjustable") ||
    normalizedLegacyType.includes("self-compensating")
  ) {
    return "NON_ADJUSTABLE";
  }

  return "SPECIALTY";
}

export function resolveProductFamilySeed(
  model: string | null | undefined,
  legacyTypeLabel: string | null | undefined,
) {
  const seriesSeed = getCanonicalProductFamilySeedBySeriesCode(extractSeriesCode(model));

  if (seriesSeed) {
    return seriesSeed;
  }

  const productTypeCode = resolveProductTypeCode(model, legacyTypeLabel);
  return canonicalProductFamilySeeds.find((seed) => seed.typeCode === productTypeCode) ?? null;
}

const typeLabelByLocale: Record<ProductTypeCodeValue, Record<Locale, string>> = {
  ADJUSTABLE: {
    en: "Adjustable",
    "zh-cn": "可调型",
    de: "Adjustable",
    fr: "Adjustable",
    it: "Adjustable",
  },
  NON_ADJUSTABLE: {
    en: "Self-compensating / non-adjustable",
    "zh-cn": "自补偿 / 不可调型",
    de: "Self-compensating / non-adjustable",
    fr: "Self-compensating / non-adjustable",
    it: "Self-compensating / non-adjustable",
  },
  HEAVY_DUTY: {
    en: "Heavy duty",
    "zh-cn": "重载型",
    de: "Heavy duty",
    fr: "Heavy duty",
    it: "Heavy duty",
  },
  BUFFER: {
    en: "Buffer",
    "zh-cn": "缓冲器",
    de: "Buffer",
    fr: "Buffer",
    it: "Buffer",
  },
  ISOLATOR: {
    en: "Vibration isolator",
    "zh-cn": "隔振器",
    de: "Vibration isolator",
    fr: "Vibration isolator",
    it: "Vibration isolator",
  },
  SPECIALTY: {
    en: "Specialty product",
    "zh-cn": "专项产品",
    de: "Specialty product",
    fr: "Specialty product",
    it: "Specialty product",
  },
};

export function getLocalizedTypeCodeLabel(
  locale: Locale,
  typeCode: ProductTypeCodeValue | null | undefined,
  fallback?: string | null,
) {
  if (!typeCode) {
    return fallback ?? (locale === "zh-cn" ? "其他" : "Other");
  }

  return typeLabelByLocale[typeCode]?.[locale] ?? fallback ?? typeCode;
}

const legacyCatalogTitleMap = new Map<string, ProductFamilySlug[]>(
  canonicalProductFamilySeeds.flatMap((seed) =>
    seed.legacyCatalogTitles.map((title) => [title, [seed.slug]] as const),
  ),
);

legacyCatalogTitleMap.set("缓冲器", [
  "adjustable-shock-absorbers",
  "non-adjustable-shock-absorbers",
  "super-long-life-shock-absorbers",
]);
legacyCatalogTitleMap.set("重型缓冲器", ["heavy-duty-shock-absorbers"]);
legacyCatalogTitleMap.set("钢绳隔振器", ["wire-rope-vibration-isolators"]);
legacyCatalogTitleMap.set("特种隔振器", ["special-vibration-isolators"]);

export function getFamilySlugsForLegacyCatalogTitle(title: string) {
  return legacyCatalogTitleMap.get(title.trim()) ?? [];
}
