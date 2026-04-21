"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import type { ProductListItem, ProductSearchResult } from "@/lib/products/schemas";

const defaultFilters = {
  typeCode: "",
  minStrokeMm: "",
  minEnergyPerCycleNm: "",
  minEnergyPerHourNm: "",
  minImpactForceN: "",
  minThrustForceN: "",
  maxTotalLengthMm: "",
  threadSize: "",
};

type Filters = typeof defaultFilters;
type NumericFilterKey = Exclude<keyof Filters, "typeCode" | "threadSize">;
type SortByValue =
  | "model"
  | "strokeMm"
  | "energyPerCycleNm"
  | "energyPerHourNm"
  | "maxImpactForceN"
  | "maxThrustForceN"
  | "totalLengthMm";
type SortDirectionValue = "asc" | "desc";

type BuyerSearchClientProps = {
  locale: Locale;
  copy: SiteCopy["buyer"];
  productTypeOptions: Array<{
    value: string;
    label: string;
  }>;
  threadSizeOptions: string[];
};

function formatValue(value: number | string | null) {
  if (value === null || value === "") {
    return "—";
  }

  return value;
}

function getBuyerUiText(locale: Locale) {
  if (locale === "zh-cn") {
    return {
      allTypes: "全部类型",
      allThreadSizes: "全部螺纹",
      sortBy: "排序字段",
      sortDirection: "排序方向",
      pageSize: "每页条数",
      previousPage: "上一页",
      nextPage: "下一页",
      pageLabel: "页码",
      resultRange: "当前显示",
      sortOptions: [
        { value: "model", label: "型号" },
        { value: "strokeMm", label: "行程" },
        { value: "energyPerCycleNm", label: "单次能量" },
        { value: "energyPerHourNm", label: "小时能量" },
        { value: "maxImpactForceN", label: "冲击力" },
        { value: "maxThrustForceN", label: "推进力" },
        { value: "totalLengthMm", label: "总长度" },
      ] as Array<{ value: SortByValue; label: string }>,
      directionOptions: [
        { value: "asc", label: "升序" },
        { value: "desc", label: "降序" },
      ] as Array<{ value: SortDirectionValue; label: string }>,
    };
  }

  return {
    allTypes: "All types",
    allThreadSizes: "All thread sizes",
    sortBy: "Sort by",
    sortDirection: "Direction",
    pageSize: "Rows per page",
    previousPage: "Previous",
    nextPage: "Next",
    pageLabel: "Page",
    resultRange: "Showing",
    sortOptions: [
      { value: "model", label: "Model" },
      { value: "strokeMm", label: "Stroke" },
      { value: "energyPerCycleNm", label: "Energy / cycle" },
      { value: "energyPerHourNm", label: "Energy / hour" },
      { value: "maxImpactForceN", label: "Impact force" },
      { value: "maxThrustForceN", label: "Thrust force" },
      { value: "totalLengthMm", label: "Length" },
    ] as Array<{ value: SortByValue; label: string }>,
    directionOptions: [
      { value: "asc", label: "Ascending" },
      { value: "desc", label: "Descending" },
    ] as Array<{ value: SortDirectionValue; label: string }>,
  };
}

const numericFieldMeta: Record<
  NumericFilterKey,
  {
    inputMode: "decimal" | "numeric";
    step: string;
    min: number;
    unit: string;
    placeholder: Record<Locale, string>;
  }
> = {
  minStrokeMm: {
    inputMode: "decimal",
    step: "0.001",
    min: 0,
    unit: "mm",
    placeholder: {
      en: "e.g. 25",
      "zh-cn": "如 25",
      de: "e.g. 25",
      fr: "e.g. 25",
      it: "e.g. 25",
    },
  },
  minEnergyPerCycleNm: {
    inputMode: "decimal",
    step: "0.001",
    min: 0,
    unit: "Nm",
    placeholder: {
      en: "e.g. 120",
      "zh-cn": "如 120",
      de: "e.g. 120",
      fr: "e.g. 120",
      it: "e.g. 120",
    },
  },
  minEnergyPerHourNm: {
    inputMode: "decimal",
    step: "0.001",
    min: 0,
    unit: "Nm/h",
    placeholder: {
      en: "e.g. 50000",
      "zh-cn": "如 50000",
      de: "e.g. 50000",
      fr: "e.g. 50000",
      it: "e.g. 50000",
    },
  },
  minImpactForceN: {
    inputMode: "decimal",
    step: "0.001",
    min: 0,
    unit: "N",
    placeholder: {
      en: "e.g. 3000",
      "zh-cn": "如 3000",
      de: "e.g. 3000",
      fr: "e.g. 3000",
      it: "e.g. 3000",
    },
  },
  minThrustForceN: {
    inputMode: "decimal",
    step: "0.001",
    min: 0,
    unit: "N",
    placeholder: {
      en: "e.g. 1500",
      "zh-cn": "如 1500",
      de: "e.g. 1500",
      fr: "e.g. 1500",
      it: "e.g. 1500",
    },
  },
  maxTotalLengthMm: {
    inputMode: "decimal",
    step: "0.001",
    min: 0,
    unit: "mm",
    placeholder: {
      en: "e.g. 250",
      "zh-cn": "如 250",
      de: "e.g. 250",
      fr: "e.g. 250",
      it: "e.g. 250",
    },
  },
};

export function BuyerSearchClient({
  locale,
  copy,
  productTypeOptions,
  threadSizeOptions,
}: BuyerSearchClientProps) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortByValue>("model");
  const [sortDirection, setSortDirection] = useState<SortDirectionValue>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [result, setResult] = useState<ProductSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const uiText = getBuyerUiText(locale);
  const currentSearchState = useCallback(
    () => ({
      filters,
      sortBy,
      sortDirection,
      page,
      pageSize,
    }),
    [filters, page, pageSize, sortBy, sortDirection],
  );

  const buildPayload = useCallback((input: {
    filters: Filters;
    sortBy: SortByValue;
    sortDirection: SortDirectionValue;
    page: number;
    pageSize: number;
  }) => ({
    locale,
    sortBy: input.sortBy,
    sortDirection: input.sortDirection,
    page: input.page,
    pageSize: input.pageSize,
    ...Object.fromEntries(
      Object.entries(input.filters)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [key, value]),
    ),
  }), [locale]);

  const runSearch = useCallback((nextState = currentSearchState()) => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/products/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(nextState)),
        });

        const data = (await response.json()) as ProductSearchResult & { message?: string };

        if (!response.ok) {
          throw new Error(data.message || copy.errors.searchFailed);
        }

        setResult(data);
      } catch (searchError) {
        setError(
          searchError instanceof Error ? searchError.message : copy.errors.searchFailed,
        );
      }
    });
  }, [buildPayload, copy.errors.searchFailed, currentSearchState]);

  function handleInputChange(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function handleSelectChange(key: "typeCode" | "threadSize", value: string) {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    setPage(1);
  }

  function handleSortByChange(value: SortByValue) {
    setSortBy(value);
    setPage(1);
  }

  function handleSortDirectionChange(value: SortDirectionValue) {
    setSortDirection(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function clearFilters() {
    setFilters(defaultFilters);
    setSortBy("model");
    setSortDirection("asc");
    setPage(1);
    setPageSize(20);
    setError(null);
  }

  const fieldEntries: Array<[NumericFilterKey, string]> = [
    ["minStrokeMm", copy.fields.minStrokeMm],
    ["minEnergyPerCycleNm", copy.fields.minEnergyPerCycleNm],
    ["minEnergyPerHourNm", copy.fields.minEnergyPerHourNm],
    ["minImpactForceN", copy.fields.minImpactForceN],
    ["minThrustForceN", copy.fields.minThrustForceN],
    ["maxTotalLengthMm", copy.fields.maxTotalLengthMm],
  ];

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      runSearch(currentSearchState());
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runSearch(currentSearchState());
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [currentSearchState, runSearch]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const rangeStart = result && result.total > 0 ? (result.page - 1) * result.pageSize + 1 : 0;
  const rangeEnd = result && result.total > 0
    ? Math.min(result.page * result.pageSize, result.total)
    : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-line bg-white/80 p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl border border-line bg-[#e9ede4] p-3">
            <SlidersHorizontal className="h-5 w-5 text-accent-dark" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">{copy.panelTitle}</h2>
            <p className="text-sm text-steel">{copy.panelDescription}</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm text-steel">
            <span>{copy.fields.type}</span>
            <select
              value={filters.typeCode}
              onChange={(event) => handleSelectChange("typeCode", event.target.value)}
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
            >
              <option value="">{uiText.allTypes}</option>
              {productTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-steel">
            <span>{copy.fields.threadSize}</span>
            <select
              value={filters.threadSize}
              onChange={(event) => handleSelectChange("threadSize", event.target.value)}
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
            >
              <option value="">{uiText.allThreadSizes}</option>
              {threadSizeOptions.map((threadSize) => (
                <option key={threadSize} value={threadSize}>
                  {threadSize}
                </option>
              ))}
            </select>
          </label>
          {fieldEntries.map(([key, label]) => (
            <label key={key} className="space-y-2 text-sm text-steel">
              <span className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <span className="text-xs uppercase tracking-[0.12em] text-steel/70">
                  {numericFieldMeta[key].unit}
                </span>
              </span>
              <input
                type="number"
                value={filters[key]}
                onChange={(event) => handleInputChange(key, event.target.value)}
                inputMode={numericFieldMeta[key].inputMode}
                step={numericFieldMeta[key].step}
                min={numericFieldMeta[key].min}
                placeholder={numericFieldMeta[key].placeholder[locale]}
                className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => runSearch(currentSearchState())} variant="accent" disabled={isPending}>
            <Search className="mr-2 h-4 w-4" />
            {isPending ? copy.buttons.searching : copy.buttons.search}
          </Button>
          <Button onClick={clearFilters} variant="secondary" type="button">
            {copy.buttons.clear}
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>

      <BuyerSearchResults
        locale={locale}
        copy={copy}
        result={result}
        sortBy={sortBy}
        sortDirection={sortDirection}
        pageSize={pageSize}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        uiText={uiText}
        onSortByChange={handleSortByChange}
        onSortDirectionChange={handleSortDirectionChange}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

function BuyerSearchResults({
  locale,
  copy,
  result,
  sortBy,
  sortDirection,
  pageSize,
  totalPages,
  rangeStart,
  rangeEnd,
  uiText,
  onSortByChange,
  onSortDirectionChange,
  onPageSizeChange,
  onPageChange,
}: {
  locale: Locale;
  copy: SiteCopy["buyer"];
  result: ProductSearchResult | null;
  sortBy: SortByValue;
  sortDirection: SortDirectionValue;
  pageSize: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  uiText: ReturnType<typeof getBuyerUiText>;
  onSortByChange: (value: SortByValue) => void;
  onSortDirectionChange: (value: SortDirectionValue) => void;
  onPageSizeChange: (value: number) => void;
  onPageChange: (value: number) => void;
}) {
  if (!result) {
    return (
      <div className="rounded-[2rem] border border-dashed border-line bg-[#e9ede4] p-8 text-sm leading-7 text-steel">
        {copy.emptyState}
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-line bg-white/80 p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">{copy.resultsTitle}</h2>
          <p className="mt-2 text-sm text-steel">
            {result.total} {copy.resultsSummary}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-2 text-sm text-steel">
            <span>{uiText.sortBy}</span>
            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as SortByValue)}
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
            >
              {uiText.sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-steel">
            <span>{uiText.sortDirection}</span>
            <select
              value={sortDirection}
              onChange={(event) => onSortDirectionChange(event.target.value as SortDirectionValue)}
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
            >
              {uiText.directionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-steel">
            <span>{uiText.pageSize}</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {result.items.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.14em] text-steel">
                  <th className="pb-2">{copy.table.model}</th>
                  <th className="pb-2">{copy.table.type}</th>
                  <th className="pb-2">{copy.table.stroke}</th>
                  <th className="pb-2">{copy.table.energyPerCycle}</th>
                  <th className="pb-2">{copy.table.energyPerHour}</th>
                  <th className="pb-2">{copy.table.impactForce}</th>
                  <th className="pb-2">{copy.table.thrustForce}</th>
                  <th className="pb-2">{copy.table.length}</th>
                  <th className="pb-2">{copy.table.thread}</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item: ProductListItem) => (
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
                    <td className="px-4 py-4">{formatValue(item.maxImpactForceN)}</td>
                    <td className="px-4 py-4">{formatValue(item.maxThrustForceN)}</td>
                    <td className="px-4 py-4">{formatValue(item.totalLengthMm)}</td>
                    <td className="rounded-r-2xl px-4 py-4">{formatValue(item.threadSize)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-line bg-sand px-5 py-4 text-sm text-steel md:flex-row md:items-center md:justify-between">
            <p>
              {uiText.resultRange} {rangeStart}-{rangeEnd} / {result.total}
            </p>
            <div className="flex items-center gap-3">
              <span>
                {uiText.pageLabel} {result.page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={result.page <= 1}
                onClick={() => onPageChange(result.page - 1)}
              >
                {uiText.previousPage}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={result.page >= totalPages}
                onClick={() => onPageChange(result.page + 1)}
              >
                {uiText.nextPage}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm leading-7 text-steel">{copy.noResults}</p>
      )}
    </div>
  );
}
