"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getModelAnchorId } from "@/lib/catalog/model-anchor";
import type { Locale } from "@/lib/i18n/config";
import { getSiteUiCopy } from "@/lib/i18n/site-ui-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import {
  readInquiryItems,
  removeInquiryItem,
  updateInquiryItem,
  type InquiryItem,
} from "@/lib/inquiry/inquiry-storage";

type InquiryPageClientProps = {
  locale: Locale;
};

function formatSummaryValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function InquiryPageClient({ locale }: InquiryPageClientProps) {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const copy = locale === "zh-cn"
    ? {
        title: "询盘清单",
        description: "确认需要咨询的型号，补充数量或备注后发送询盘。",
        empty: "当前询盘清单为空。可以从工程师选型或产品表格中加入型号。",
        model: "型号",
        series: "系列",
        source: "来源",
        quantity: "数量",
        note: "备注",
        remove: "移除",
        send: "发送询盘",
        back: "返回选型",
        sourceEngineer: "工程师选型",
        sourceBuyer: "采购筛选",
        sourceProduct: "产品详情",
        loginNotice: "按原需求，加入询盘、查看询盘和提交询盘前需要接入 Google 等第三方快速登录；当前代码尚未接入认证模块。",
        variant: "工况",
        input: "输入参数",
        result: "计算结果",
        filter: "筛选条件",
      }
    : {
        title: "Inquiry list",
        description: "Review selected models, add quantities or notes, then send the inquiry.",
        empty: "Your inquiry list is empty. Add models from the engineer selector or product tables.",
        model: "Model",
        series: "Series",
        source: "Source",
        quantity: "Quantity",
        note: "Note",
        remove: "Remove",
        send: "Send inquiry",
        back: "Back to selector",
        sourceEngineer: "Engineer selector",
        sourceBuyer: "Buyer filter",
        sourceProduct: "Product detail",
        loginNotice: "Original requirements call for Google or other third-party quick login before adding, viewing, or submitting inquiry items; auth is not wired in the current code yet.",
        variant: "Scenario",
        input: "Input",
        result: "Result",
        filter: "Filter",
      };

  useEffect(() => {
    setItems(readInquiryItems());
  }, []);

  const contactHref = useMemo(() => {
    const models = items.map((item) => item.model).join(",");
    return getLocalizedHref(locale, `/contact?models=${encodeURIComponent(models)}`);
  }, [items, locale]);

  function handleRemove(model: string) {
    setItems(removeInquiryItem(model));
  }

  function handleUpdate(item: InquiryItem, quantity: number, note: string) {
    setItems(updateInquiryItem(item.model, { quantity, note }));
  }

  function getSourceLabel(item: InquiryItem) {
    if (item.source === "engineer") return copy.sourceEngineer;
    if (item.source === "buyer") return copy.sourceBuyer;
    return copy.sourceProduct;
  }

  function renderSummary(summary: Record<string, unknown> | undefined) {
    if (!summary || Object.keys(summary).length === 0) {
      return null;
    }

    return (
      <dl className="mt-2 grid gap-2 text-xs text-steel md:grid-cols-2">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-line bg-white px-3 py-2">
            <dt className="font-medium text-ink">{key}</dt>
            <dd className="mt-1 break-words">{formatSummaryValue(value)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-line bg-white p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-accent-dark">Inquiry</p>
            <h1 className="mt-3 font-sans text-4xl font-semibold text-ink">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-steel">{copy.description}</p>
          </div>
          <Link href={getLocalizedHref(locale, "/selector/engineer")} className="text-sm font-medium text-accent-dark">
            {copy.back}
          </Link>
        </div>
      </div>

      {items.length ? (
        <div className="rounded-xl border border-line bg-white p-6">
          <div className="mb-5 rounded-lg border border-line bg-sand p-4 text-sm leading-7 text-steel">
            {getSiteUiCopy(locale).localDraft}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-steel">
                <tr>
                  <th className="pb-2">{copy.model}</th>
                  <th className="pb-2">{copy.series}</th>
                  <th className="pb-2">{copy.source}</th>
                  <th className="pb-2">{copy.quantity}</th>
                  <th className="pb-2">{copy.note}</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <Fragment key={item.model}>
                    <tr className="bg-mist text-ink">
                      <td className="rounded-l-2xl px-4 py-4 font-medium">
                        <Link
                          href={getLocalizedHref(locale, `/products/${item.familySlug}/${item.seriesSlug}?model=${encodeURIComponent(item.model)}#${getModelAnchorId(item.model)}`)}
                          className="hover:text-accent-dark"
                        >
                          {item.model}
                        </Link>
                      </td>
                      <td className="px-4 py-4">{item.seriesName}</td>
                      <td className="px-4 py-4">{getSourceLabel(item)}</td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) => handleUpdate(item, Number(event.target.value), item.note)}
                          className="w-20 rounded-xl border border-line bg-white px-3 py-2 text-ink"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(event) => handleUpdate(item, item.quantity, event.target.value)}
                          className="w-56 rounded-xl border border-line bg-white px-3 py-2 text-ink"
                        />
                      </td>
                      <td className="rounded-r-2xl px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.model)}
                          className="text-xs font-medium text-steel hover:text-accent-dark"
                        >
                          {copy.remove}
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="rounded-lg border border-line bg-sand p-4">
                        <div className="grid gap-4 lg:grid-cols-3">
                          {item.variantKey ? (
                            <section>
                              <h3 className="text-xs uppercase tracking-[0.14em] text-steel">{copy.variant}</h3>
                              <p className="mt-2 text-sm font-medium text-ink">{item.variantKey}</p>
                            </section>
                          ) : null}
                          <section>
                            <h3 className="text-xs uppercase tracking-[0.14em] text-steel">{copy.input}</h3>
                            {renderSummary(item.inputSummary)}
                          </section>
                          <section>
                            <h3 className="text-xs uppercase tracking-[0.14em] text-steel">{copy.result}</h3>
                            {renderSummary(item.resultSummary)}
                          </section>
                          <section className="lg:col-span-3">
                            <h3 className="text-xs uppercase tracking-[0.14em] text-steel">{copy.filter}</h3>
                            {renderSummary(item.filterSummary)}
                          </section>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <Link href={contactHref}>
              <Button variant="accent">{copy.send}</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-mist p-8 text-sm leading-7 text-steel">
          {copy.empty}
        </div>
      )}
    </div>
  );
}
