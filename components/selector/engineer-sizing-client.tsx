"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Calculator, ChevronRight, FlaskConical, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadableFilter } from "@/components/selector/readable-filter";
import type { CalculateResponse } from "@/lib/calculators/types";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedProductFamilyName } from "@/lib/i18n/product-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import type { ProductListItem } from "@/lib/products/schemas";

type ScenarioField = {
  key: string;
  type: string;
  label: string;
  unit?: string;
  required?: boolean;
};

type ScenarioEntry = {
  key: string;
  name: string;
  description: string;
  implementedVariantCount: number;
  totalVariantCount: number;
};

type ScenarioQuestionOption = {
  value: string;
  label: string;
};

type ScenarioGuideQuestion = {
  key: string;
  label: string;
  helperText: string;
  options: ScenarioQuestionOption[];
};

type ScenarioFamily = {
  key: string;
  entryKey: string;
  name: string;
  description: string;
  guideQuestions: ScenarioGuideQuestion[];
};

type ScenarioVariant = {
  key: string;
  entryKey: string;
  familyKey: string;
  name: string;
  orientation: string;
  gravityRelation: string;
  loadType: string | null;
  isImplemented: boolean;
  inputSchemaJson: {
    fields?: ScenarioField[];
  };
};

const questionFieldMap = {
  orientation: "orientation",
  gravityRelation: "gravityRelation",
  loadType: "loadType",
} as const;

type QuestionKey = keyof typeof questionFieldMap;
type QuestionAnswers = Partial<Record<QuestionKey, string>>;

type ScenarioCatalogResponse = {
  entries: ScenarioEntry[];
  families: ScenarioFamily[];
  variants: ScenarioVariant[];
  message?: string;
};

type EngineerSizingClientProps = {
  locale: Locale;
  copy: SiteCopy["engineer"];
};

function formatValue(value: number | string | null) {
  if (value === null || value === "") {
    return "—";
  }

  return value;
}

function buildInitialFormValues(fields: ScenarioField[]) {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

function mergeGuideQuestions(families: ScenarioFamily[]) {
  const mergedQuestions: ScenarioGuideQuestion[] = [];
  const questionIndexByKey = new Map<string, number>();

  for (const family of families) {
    for (const question of family.guideQuestions) {
      const existingIndex = questionIndexByKey.get(question.key);

      if (existingIndex === undefined) {
        questionIndexByKey.set(question.key, mergedQuestions.length);
        mergedQuestions.push({
          ...question,
          options: [...question.options],
        });
        continue;
      }

      const existingQuestion = mergedQuestions[existingIndex];
      const seenValues = new Set(existingQuestion.options.map((option) => option.value));

      for (const option of question.options) {
        if (!seenValues.has(option.value)) {
          existingQuestion.options.push(option);
        }
      }
    }
  }

  return mergedQuestions;
}

function filterVariantsByAnswers(variants: ScenarioVariant[], answers: QuestionAnswers) {
  return variants.filter((variant) =>
    (Object.entries(questionFieldMap) as Array<[QuestionKey, keyof ScenarioVariant]>).every(
      ([questionKey, variantField]) => {
        const answer = answers[questionKey];
        if (!answer) {
          return true;
        }

        return variant[variantField] === answer;
      },
    ),
  );
}

function getVisibleQuestionOptions(question: ScenarioGuideQuestion, variants: ScenarioVariant[]) {
  const variantField = questionFieldMap[question.key as QuestionKey];
  return question.options.filter((option) =>
    variants.some((variant) => variant[variantField] === option.value),
  );
}

export function EngineerSizingClient({ locale, copy }: EngineerSizingClientProps) {
  const [catalog, setCatalog] = useState<ScenarioCatalogResponse | null>(null);
  const [selectedEntryKey, setSelectedEntryKey] = useState<string | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswers>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCatalogPending, startCatalogTransition] = useTransition();
  const searchParams = useSearchParams();

  useEffect(() => {
    startCatalogTransition(async () => {
      try {
        const response = await fetch(`/api/scenarios?locale=${locale}`);
        const data = (await response.json()) as ScenarioCatalogResponse;

        if (!response.ok) {
          throw new Error(data.message || copy.errors.loadFailed);
        }

        setCatalog(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : copy.errors.loadFailed);
      }
    });
  }, [copy.errors.loadFailed, locale]);

  const availableEntries = useMemo(
    () => catalog?.entries ?? [],
    [catalog?.entries],
  );
  const entryFamilies = useMemo(
    () =>
      selectedEntryKey
        ? (catalog?.families ?? []).filter((family) => family.entryKey === selectedEntryKey)
        : [],
    [catalog?.families, selectedEntryKey],
  );
  const guideQuestions = useMemo(
    () => mergeGuideQuestions(entryFamilies),
    [entryFamilies],
  );
  const entryVariants = useMemo(
    () =>
      selectedEntryKey
        ? (catalog?.variants ?? []).filter((variant) => variant.entryKey === selectedEntryKey)
        : [],
    [catalog?.variants, selectedEntryKey],
  );
  const matchingVariants = useMemo(
    () => filterVariantsByAnswers(entryVariants, questionAnswers),
    [entryVariants, questionAnswers],
  );
  const selectedVariant = matchingVariants.length === 1 ? matchingVariants[0] : null;
  const selectedFields = useMemo(
    () => selectedVariant?.inputSchemaJson.fields ?? [],
    [selectedVariant],
  );
  const wizardCopy = locale === "zh-cn"
    ? {
        guideTitle: "向导问题",
        matchingRoutesTitle: "当前匹配路径",
        routeNeedsMoreAnswers: "继续回答问题，系统会自动收敛到具体工况。",
        routePending: "待实现",
        pendingMessage: "该路径已识别，但底层 calculator 还未实现，建议先切回已完成的工况继续估算。",
      }
    : {
        guideTitle: "Guided questions",
        matchingRoutesTitle: "Matching routes",
        routeNeedsMoreAnswers: "Continue answering the questions and the exact sizing route will be resolved automatically.",
        routePending: "Pending",
        pendingMessage:
          "This route is recognized, but its calculator is not implemented yet. Try a completed route first for an initial estimate.",
      };
  const questionSteps = useMemo(() => {
    const nextSteps: Array<{
      question: ScenarioGuideQuestion;
      options: ScenarioQuestionOption[];
      value: string | null;
    }> = [];
    let priorAnswers: QuestionAnswers = {};

    for (const question of guideQuestions) {
      const candidateVariants = filterVariantsByAnswers(entryVariants, priorAnswers);
      const options = getVisibleQuestionOptions(question, candidateVariants);
      const questionKey = question.key as QuestionKey;
      const currentValue = questionAnswers[questionKey];

      if (options.length > 1 || currentValue) {
        nextSteps.push({
          question,
          options,
          value: currentValue ?? null,
        });
      }

      if (currentValue && options.some((option) => option.value === currentValue)) {
        priorAnswers = {
          ...priorAnswers,
          [questionKey]: currentValue,
        };
      } else if (options.length === 1) {
        priorAnswers = {
          ...priorAnswers,
          [questionKey]: options[0].value,
        };
      }
    }

    return nextSteps;
  }, [entryVariants, guideQuestions, questionAnswers]);

  useEffect(() => {
    const entryKeyFromQuery = searchParams.get("entryKey");

    if (entryKeyFromQuery && availableEntries.some((entry) => entry.key === entryKeyFromQuery)) {
      setSelectedEntryKey(entryKeyFromQuery);
      return;
    }

    if (!selectedEntryKey) {
      const firstAvailableEntry =
        availableEntries.find((entry) => entry.implementedVariantCount > 0) ?? null;
      setSelectedEntryKey(firstAvailableEntry?.key ?? null);
    }
  }, [availableEntries, searchParams, selectedEntryKey]);

  useEffect(() => {
    if (!guideQuestions.length) {
      return;
    }

    const nextAnswers: QuestionAnswers = {};

    for (const question of guideQuestions) {
      const questionKey = question.key as QuestionKey;
      const candidateVariants = filterVariantsByAnswers(entryVariants, nextAnswers);
      const visibleOptions = getVisibleQuestionOptions(question, candidateVariants);
      const currentValue = questionAnswers[questionKey];

      if (visibleOptions.length === 1) {
        nextAnswers[questionKey] = visibleOptions[0].value;
        continue;
      }

      if (currentValue && visibleOptions.some((option) => option.value === currentValue)) {
        nextAnswers[questionKey] = currentValue;
      }
    }

    if (JSON.stringify(nextAnswers) !== JSON.stringify(questionAnswers)) {
      setQuestionAnswers(nextAnswers);
    }
  }, [entryVariants, guideQuestions, questionAnswers]);

  useEffect(() => {
    setFormValues(buildInitialFormValues(selectedFields));
    setResult(null);
    setError(null);
  }, [selectedFields, selectedVariant?.key]);

  function handleEntrySelect(entryKey: string) {
    setSelectedEntryKey(entryKey);
    setQuestionAnswers({});
    setResult(null);
    setError(null);
  }

  function handleQuestionAnswer(questionKey: QuestionKey, value: string) {
    setQuestionAnswers((current) => ({
      ...current,
      [questionKey]: current[questionKey] === value ? undefined : value,
    }));
    setResult(null);
    setError(null);
  }

  function handleFieldChange(key: string, value: string) {
    setFormValues((current) => ({ ...current, [key]: value }));
  }

  function runCalculation() {
    if (!selectedVariant?.isImplemented) {
      setError(copy.errors.chooseRoute);
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variantKey: selectedVariant.key,
            input: Object.fromEntries(
              Object.entries(formValues).filter(([, value]) => value !== ""),
            ),
            locale,
          }),
        });

        const data = (await response.json()) as CalculateResponse & { message?: string };

        if (!response.ok) {
          throw new Error(data.message || copy.errors.calculateFailed);
        }

        setResult(data);
      } catch (calculationError) {
        setResult(null);
        setError(
          calculationError instanceof Error
            ? calculationError.message
            : copy.errors.calculateFailed,
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-line bg-white/80 p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl border border-line bg-[#e9ede4] p-3">
            <Settings2 className="h-5 w-5 text-accent-dark" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{copy.selectMotionCaseTitle}</h2>
            <p className="text-sm text-steel">{copy.selectMotionCaseDescription}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {availableEntries.map((entry) => {
            const isAvailable = entry.totalVariantCount > 0;
            const isActive = selectedEntryKey === entry.key;

            return (
              <button
                key={entry.key}
                type="button"
                disabled={!isAvailable}
                onClick={() => handleEntrySelect(entry.key)}
                className={[
                  "rounded-[1.5rem] border p-5 text-left transition",
                  isActive
                    ? "border-accent bg-[#eef1ea]"
                    : "border-line bg-sand hover:border-accent/40",
                  !isAvailable ? "cursor-not-allowed opacity-60" : "",
                ].join(" ")}
              >
                <div className="text-sm font-medium text-ink">{entry.name}</div>
                <div className="mt-2 text-xs leading-5 text-steel">
                  {entry.implementedVariantCount > 0
                    ? `${entry.implementedVariantCount} ${
                        entry.implementedVariantCount === 1
                          ? copy.routeAvailableSingle
                          : copy.routeAvailablePlural
                      }`
                    : copy.routePending}
                </div>
              </button>
            );
          })}
        </div>

        {isCatalogPending ? (
          <p className="mt-4 text-sm text-steel">{copy.loadingCatalog}</p>
        ) : null}
      </div>

      {selectedEntryKey ? (
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-accent-dark" />
              <h2 className="font-display text-2xl font-semibold">{wizardCopy.guideTitle}</h2>
            </div>

            <div className="mt-6 space-y-6">
              {questionSteps.map((step) => (
                <div key={step.question.key} className="rounded-[1.5rem] border border-line bg-white/70 p-5">
                  <div className="text-sm font-medium text-ink">{step.question.label}</div>
                  <p className="mt-2 text-xs leading-5 text-steel">{step.question.helperText}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {step.options.map((option) => {
                      const isSelected = step.value === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleQuestionAnswer(step.question.key as QuestionKey, option.value)}
                          className={[
                            "rounded-full border px-4 py-2 text-sm transition",
                            isSelected
                              ? "border-accent bg-[#eef1ea] text-ink"
                              : "border-line bg-sand text-steel hover:border-accent/40 hover:text-ink",
                          ].join(" ")}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="rounded-[1.5rem] border border-line bg-white/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-ink">{wizardCopy.matchingRoutesTitle}</h3>
                  {selectedVariant && !selectedVariant.isImplemented ? (
                    <Badge>{wizardCopy.routePending}</Badge>
                  ) : null}
                </div>

                {matchingVariants.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {matchingVariants.map((variant) => (
                      <div
                        key={variant.key}
                        className={[
                          "flex items-center justify-between rounded-[1.25rem] border px-4 py-4",
                          selectedVariant?.key === variant.key
                            ? "border-accent bg-[#eef1ea]"
                            : "border-line bg-sand",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">{variant.name}</span>
                          {!variant.isImplemented ? <Badge>{copy.comingSoon}</Badge> : null}
                        </span>
                        {selectedVariant?.key === variant.key ? null : (
                          <ChevronRight className="h-4 w-4 text-steel" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-steel">{copy.routePending}</p>
                )}
              </div>

              {!selectedVariant ? (
                <p className="text-sm leading-7 text-steel">{wizardCopy.routeNeedsMoreAnswers}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-[2rem] border border-line bg-white/80 p-8">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-accent-dark" />
              <div>
                <h2 className="font-display text-2xl font-semibold">{copy.inputTitle}</h2>
                <p className="text-sm text-steel">{copy.inputDescription}</p>
              </div>
            </div>

            {selectedVariant?.isImplemented ? (
              <>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {selectedFields.map((field) => (
                    <label key={field.key} className="space-y-2 text-sm text-steel">
                      <span>
                        {field.label}
                        {field.unit ? ` (${field.unit})` : ""}
                      </span>
                      <input
                        type="number"
                        value={formValues[field.key] ?? ""}
                        onChange={(event) => handleFieldChange(field.key, event.target.value)}
                        className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={runCalculation} variant="accent" disabled={isPending}>
                    {isPending ? copy.buttons.calculating : copy.buttons.calculate}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setFormValues(buildInitialFormValues(selectedFields))}
                  >
                    {copy.buttons.reset}
                  </Button>
                </div>
              </>
            ) : selectedVariant ? (
              <p className="mt-6 text-sm leading-7 text-steel">{wizardCopy.pendingMessage}</p>
            ) : (
              <p className="mt-6 text-sm leading-7 text-steel">{copy.chooseRoute}</p>
            )}

            {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-line bg-[#e9ede4] p-8 text-sm leading-7 text-steel">
          {copy.beginPrompt}
        </div>
      )}

      <EngineerCalculationResult locale={locale} copy={copy} result={result} />

      {availableEntries.length > 0 ? (
        <div className="rounded-[2rem] border border-line bg-white/80 p-8 text-sm leading-7 text-steel">
          {copy.tip}
        </div>
      ) : null}
    </div>
  );
}

function EngineerCalculationResult({
  locale,
  copy,
  result,
}: {
  locale: Locale;
  copy: SiteCopy["engineer"];
  result: CalculateResponse | null;
}) {
  if (!result) {
    return null;
  }

  const detailLabelMap: Record<string, Record<Locale, string>> = {
    kineticEnergyNm: { en: "Kinetic energy", "zh-cn": "动能", de: "Kinetische Energie", fr: "Énergie cinétique", it: "Energia cinetica" },
    workingEnergyNm: { en: "Working energy", "zh-cn": "做功能量", de: "Arbeitsenergie", fr: "Énergie de travail", it: "Energia di lavoro" },
    totalEnergyPerCycleNm: { en: "Total energy / cycle", "zh-cn": "总能量（每次）", de: "Gesamtenergie / Zyklus", fr: "Énergie totale / cycle", it: "Energia totale / ciclo" },
    totalEnergyPerHourNm: { en: "Total energy / hour", "zh-cn": "总能量（每小时）", de: "Gesamtenergie / Stunde", fr: "Énergie totale / heure", it: "Energia totale / ora" },
    thrustForceN: { en: "Thrust force", "zh-cn": "推进力", de: "Schubkraft", fr: "Force de poussée", it: "Forza di spinta" },
    decelerationG: { en: "Deceleration", "zh-cn": "减速加速度", de: "Verzögerung", fr: "Décélération", it: "Decelerazione" },
    impactVelocityMs: { en: "Impact velocity", "zh-cn": "冲击速度", de: "Aufprallgeschwindigkeit", fr: "Vitesse d'impact", it: "Velocità d'impatto" },
  };

  function getDetailLabel(key: string) {
    return detailLabelMap[key]?.[locale] ?? key;
  }

  const preferredSummaryKeys = [
    "kineticEnergyNm",
    "workingEnergyNm",
    "totalEnergyPerCycleNm",
    "totalEnergyPerHourNm",
    "thrustForceN",
  ];

  const summaryMetricCards = result.calculation.detailMetrics?.length
    ? preferredSummaryKeys
        .map((key) => result.calculation.detailMetrics?.find((metric) => metric.key === key))
        .filter((metric): metric is NonNullable<typeof metric> => Boolean(metric))
    : [];
  const usesThrustMetric =
    Boolean((result.filter as Record<string, unknown>).minThrustForceN) ||
    Boolean(result.calculation.detailMetrics?.some((metric) => metric.key === "thrustForceN"));
  const forceColumnLabel = usesThrustMetric
    ? (locale === "zh-cn"
      ? "推进力"
      : locale === "de"
        ? "Schubkraft"
        : locale === "fr"
          ? "Force de poussée"
          : locale === "it"
            ? "Forza di spinta"
            : "Thrust force")
    : copy.result.table.impactForce;
  const getForceCellValue = (item: ProductListItem) =>
    usesThrustMetric ? formatValue(item.maxThrustForceN) : formatValue(item.maxImpactForceN);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-line bg-white/80 p-8">
        <h2 className="font-display text-2xl font-semibold">{copy.result.title}</h2>
        {summaryMetricCards.length ? (
          <div className="mt-6">
            <div className="mb-3 text-xs uppercase tracking-[0.14em] text-steel">
              {locale === "zh-cn" ? "关键公式结果" : "Key formula outputs"}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {summaryMetricCards.map((metric) => (
                <div key={metric.key} className="rounded-[1.5rem] border border-line bg-[#eef1ea] p-5">
                  <div className="text-xs uppercase tracking-[0.14em] text-steel">{getDetailLabel(metric.key)}</div>
                  <div className="mt-3 text-sm font-medium text-ink">
                    {String(metric.value)} {metric.unit}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-[1.5rem] border border-line bg-white p-5">
                <div className="text-xs uppercase tracking-[0.14em] text-steel">
                  {copy.result.labels.requiredStroke}
                </div>
                <div className="mt-3 text-sm font-medium text-ink">
                  {String(result.calculation.requiredStrokeMm ?? "—")} mm
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-white p-5">
                <div className="text-xs uppercase tracking-[0.14em] text-steel">
                  {copy.result.labels.suggestedFamily}
                </div>
                <div className="mt-3 text-sm font-medium text-ink">
                  {getLocalizedProductFamilyName(
                    locale,
                    result.calculation.recommendedFamilySlug,
                    String(result.calculation.recommendedFamilySlug ?? "—"),
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              [copy.result.labels.requiredStroke, `${String(result.calculation.requiredStrokeMm ?? "—")} mm`],
              [copy.result.labels.energyPerCycle, result.calculation.requiredEnergyPerCycleNm],
              [copy.result.labels.energyPerHour, result.calculation.requiredEnergyPerHourNm],
              [copy.result.labels.averageImpactForce, result.calculation.averageImpactForceN],
              [
                copy.result.labels.suggestedFamily,
                getLocalizedProductFamilyName(
                  locale,
                  result.calculation.recommendedFamilySlug,
                  String(result.calculation.recommendedFamilySlug ?? "—"),
                ),
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] border border-line bg-[#eef1ea] p-5">
                <div className="text-xs uppercase tracking-[0.14em] text-steel">{label}</div>
                <div className="mt-3 text-sm font-medium text-ink">{String(value ?? "—")}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h3 className="font-display text-xl font-semibold">{copy.result.whyFitsTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-steel">
              {result.explanations.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold">{copy.result.criteriaTitle}</h3>
            <div className="mt-4">
              <ReadableFilter filter={result.filter as Record<string, number | string>} locale={locale} />
            </div>
          </div>
        </div>

        {result.calculation.detailMetrics?.length ? (
          <div className="mt-8 rounded-[1.5rem] border border-line bg-sand p-5">
            <h3 className="font-display text-xl font-semibold">
              {locale === "zh-cn" ? "公式结果明细" : "Calculation breakdown"}
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-steel">
                    <th className="pb-3">{locale === "zh-cn" ? "计算结果" : "Metric"}</th>
                    <th className="pb-3">{locale === "zh-cn" ? "数值" : "Value"}</th>
                    <th className="pb-3">{locale === "zh-cn" ? "单位" : "Unit"}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.calculation.detailMetrics.map((metric) => (
                    <tr key={metric.key} className="border-t border-line/70">
                      <td className="py-3 font-medium text-ink">{getDetailLabel(metric.key)}</td>
                      <td className="py-3 text-ink">{String(metric.value)}</td>
                      <td className="py-3 text-steel">{metric.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-line bg-white/80 p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">{copy.result.matchesTitle}</h2>
            <p className="mt-2 text-sm text-steel">
              {result.matches.total} {copy.result.matchesSummary}
            </p>
          </div>
        </div>

        {result.matches.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.14em] text-steel">
                  <th className="pb-2">{copy.result.table.model}</th>
                  <th className="pb-2">{copy.result.table.type}</th>
                  <th className="pb-2">{copy.result.table.stroke}</th>
                  <th className="pb-2">{copy.result.table.energyPerCycle}</th>
                  <th className="pb-2">{copy.result.table.energyPerHour}</th>
                  <th className="pb-2">{forceColumnLabel}</th>
                  <th className="pb-2">{copy.result.table.thread}</th>
                </tr>
              </thead>
              <tbody>
                {result.matches.items.map((item: ProductListItem) => (
                  <tr key={item.id} className="rounded-2xl bg-[#eef1ea] text-ink">
                    <td className="rounded-l-2xl px-4 py-4 font-medium">
                      <Link
                        href={getLocalizedHref(locale, `/products/catalog/${item.id}`)}
                        className="hover:text-accent-dark"
                      >
                        {item.model}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{item.localizedTypeLabel}</td>
                    <td className="px-4 py-4">{formatValue(item.strokeMm)}</td>
                    <td className="px-4 py-4">{formatValue(item.energyPerCycleNm)}</td>
                    <td className="px-4 py-4">{formatValue(item.energyPerHourNm)}</td>
                    <td className="px-4 py-4">{getForceCellValue(item)}</td>
                    <td className="rounded-r-2xl px-4 py-4">{formatValue(item.threadSize)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-7 text-steel">{copy.result.noMatches}</p>
        )}
      </div>
    </div>
  );
}
