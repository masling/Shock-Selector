"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import type { CatalogModelSearchResult } from "@/lib/catalog/catalog-schemas";

const defaultFilters = {
  modelQuery: "",
  seriesCode: "",
  selectorOnly: "false",
  minStrokeMm: "",
  minEnergyPerCycleNm: "",
  minEnergyPerHourNm: "",
  minImpactForceN: "",
  threadSize: "",
};

type BuyerSearchClientProps = {
  locale: Locale;
  copy: SiteCopy["buyer"];
  threadSizeOptions: string[];
};

export function BuyerSearchClient({ locale, copy, threadSizeOptions }: BuyerSearchClientProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<CatalogModelSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildPayload = useCallback(() => ({
    locale,
    page,
    pageSize: 20,
    includeIncomplete: true,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")),
  }), [filters, locale, page]);

  const runSearch = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/products/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const data = (await response.json()) as CatalogModelSearchResult & { message?: string };
        if (!response.ok) throw new Error(data.message || copy.errors.searchFailed);
        setResult(data);
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : copy.errors.searchFailed);
      }
    });
  }, [buildPayload, copy.errors.searchFailed]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSearch, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [runSearch]);

  function updateFilter(key: keyof typeof defaultFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

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
            <span>Model</span>
            <input
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
              value={filters.modelQuery}
              onChange={(event) => updateFilter("modelQuery", event.target.value)}
              placeholder="EK, WR6, HGGN"
            />
          </label>
          <label className="space-y-2 text-sm text-steel">
            <span>Series</span>
            <input
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
              value={filters.seriesCode}
              onChange={(event) => updateFilter("seriesCode", event.target.value)}
              placeholder="EK, EN, WR"
            />
          </label>
          <label className="space-y-2 text-sm text-steel">
            <span>{copy.fields.threadSize}</span>
            <select
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
              value={filters.threadSize}
              onChange={(event) => updateFilter("threadSize", event.target.value)}
            >
              <option value="">All threads</option>
              {threadSizeOptions.map((thread) => <option key={thread} value={thread}>{thread}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm text-steel">
            <span>Selector range</span>
            <select
              className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
              value={filters.selectorOnly}
              onChange={(event) => updateFilter("selectorOnly", event.target.value)}
            >
              <option value="false">All catalog models</option>
              <option value="true">Absorber selector range</option>
            </select>
          </label>
          <NumberInput label={copy.fields.minStrokeMm} value={filters.minStrokeMm} onChange={(value) => updateFilter("minStrokeMm", value)} unit="mm" />
          <NumberInput label={copy.fields.minEnergyPerCycleNm} value={filters.minEnergyPerCycleNm} onChange={(value) => updateFilter("minEnergyPerCycleNm", value)} unit="Nm/c" />
          <NumberInput label={copy.fields.minEnergyPerHourNm} value={filters.minEnergyPerHourNm} onChange={(value) => updateFilter("minEnergyPerHourNm", value)} unit="Nm/h" />
          <NumberInput label={copy.fields.minImpactForceN} value={filters.minImpactForceN} onChange={(value) => updateFilter("minImpactForceN", value)} unit="N" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={runSearch} variant="accent" disabled={isPending}>
            <Search className="mr-2 h-4 w-4" />
            {isPending ? copy.buttons.searching : copy.buttons.search}
          </Button>
          <Button
            onClick={() => {
              setFilters(defaultFilters);
              setPage(1);
              setError(null);
            }}
            variant="secondary"
            type="button"
          >
            {copy.buttons.clear}
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="rounded-[2rem] border border-line bg-white/80 p-8">
        {!result ? (
          <p className="text-sm leading-7 text-steel">{copy.emptyState}</p>
        ) : result.items.length === 0 ? (
          <p className="text-sm leading-7 text-steel">{copy.noResults}</p>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold">{copy.resultsTitle}</h2>
              <p className="mt-2 text-sm text-steel">
                {result.total} {copy.resultsSummary}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-steel">
                    <th className="pb-2">{copy.table.model}</th>
                    <th className="pb-2">Family</th>
                    <th className="pb-2">Series</th>
                    <th className="pb-2">Selector</th>
                    <th className="pb-2">Key specs</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.id} className="rounded-2xl bg-[#eef1ea] text-ink">
                      <td className="rounded-l-2xl px-4 py-4 font-medium">
                        <Link
                          href={`/products/${item.familySlug}/${item.seriesSlug}`}
                          className="hover:text-accent-dark"
                        >
                          {item.model}
                        </Link>
                      </td>
                      <td className="px-4 py-4">{item.familyName}</td>
                      <td className="px-4 py-4">{item.seriesCode}</td>
                      <td className="px-4 py-4">{item.selectorStatus}</td>
                      <td className="rounded-r-2xl px-4 py-4">
                        {item.specs.slice(0, 4).map((spec) =>
                          `${spec.label}: ${spec.rawValue ?? spec.value ?? "—"}`
                        ).join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-line bg-sand px-5 py-4 text-sm text-steel md:flex-row md:items-center md:justify-between">
              <p>Page {result.page} / {totalPages}</p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={result.page <= 1 || isPending}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={result.page >= totalPages || isPending}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, unit }: { label: string; value: string; onChange: (value: string) => void; unit?: string }) {
  return (
    <label className="space-y-2 text-sm text-steel">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {unit ? <span className="text-xs uppercase tracking-[0.12em] text-steel/70">{unit}</span> : null}
      </span>
      <input
        className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none"
        inputMode="decimal"
        type="number"
        min="0"
        step="0.001"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
