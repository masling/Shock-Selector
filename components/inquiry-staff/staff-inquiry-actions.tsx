"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuoteDraftInput, StaffInquiryDetail, StaffStatus } from "@/lib/inquiry-staff/schemas";
import { quoteDraftSchema } from "@/lib/inquiry-staff/schemas";

type StaffInquiryActionsProps = {
  inquiryId: string;
  currentStatus: StaffStatus;
  staffRole: StaffInquiryDetail["staffRole"];
  quoteDraft: StaffInquiryDetail["quoteDraft"];
};

const statuses: StaffStatus[] = ["received", "reviewing", "awaiting_customer", "quoted", "closed"];
const statusLabels: Record<StaffStatus, string> = {
  received: "Received",
  reviewing: "Under review",
  awaiting_customer: "Awaiting customer",
  quoted: "Quoted",
  closed: "Closed",
};

const emptyQuoteLine: QuoteDraftInput["lines"][number] = {
  model: "",
  quantity: 1,
  unitPrice: "",
  leadTime: "",
  note: "",
};

const emptyQuote: QuoteDraftInput = {
  currency: "EUR",
  validity: "",
  deliveryTerm: "",
  paymentTerm: "",
  notes: "",
  lines: [{ ...emptyQuoteLine }],
};

function normalizeQuoteDraft(payload: StaffInquiryDetail["quoteDraft"]): QuoteDraftInput {
  const parsed = quoteDraftSchema.safeParse(payload?.payload);
  if (!parsed.success) return emptyQuote;
  return {
    ...emptyQuote,
    ...parsed.data,
    lines: parsed.data.lines.length ? parsed.data.lines : [{ ...emptyQuoteLine }],
  };
}

function newSubmissionKey() {
  const browserCrypto = globalThis.crypto;
  if (browserCrypto?.randomUUID) return browserCrypto.randomUUID();
  if (browserCrypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    browserCrypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0").slice(-12)}`;
}

async function postJson(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error("Request failed");
  return response.json() as Promise<unknown>;
}

export function StaffInquiryActions({ inquiryId, currentStatus, staffRole, quoteDraft }: StaffInquiryActionsProps) {
  const router = useRouter();
  const idPrefix = useId();
  const [status, setStatus] = useState<StaffStatus>(currentStatus);
  const [publicReply, setPublicReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [publicReplyKey, setPublicReplyKey] = useState(newSubmissionKey);
  const [quote, setQuote] = useState<QuoteDraftInput>(() => normalizeQuoteDraft(quoteDraft));
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isManager = staffRole === "manager";
  const isBusy = busyAction !== null;
  const isPublished = quoteDraft?.status === "published";
  const savedQuote = useMemo(() => normalizeQuoteDraft(quoteDraft), [quoteDraft]);
  const parsedQuote = useMemo(() => quoteDraftSchema.safeParse(quote), [quote]);
  const quoteIsValid = parsedQuote.success;
  const quoteDirty = JSON.stringify(parsedQuote.success ? parsedQuote.data : quote) !== JSON.stringify(savedQuote);
  const hasPersistedDraft = Boolean(quoteDraft);
  const canApproveQuote = isManager && hasPersistedDraft && !isPublished && !quoteDirty && (quoteDraft?.status === "draft" || quoteDraft?.status === "approved");
  const canPublishQuote = isManager && hasPersistedDraft && !isPublished && !quoteDirty && quoteDraft?.status === "approved";

  function updateQuoteField<K extends keyof Omit<QuoteDraftInput, "lines">>(field: K, value: QuoteDraftInput[K]) {
    setQuote((current) => ({ ...current, [field]: value }));
  }

  function updateQuoteLine<K extends keyof QuoteDraftInput["lines"][number]>(index: number, field: K, value: QuoteDraftInput["lines"][number][K]) {
    setQuote((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, [field]: value } : line),
    }));
  }

  function addQuoteLine() {
    setQuote((current) => current.lines.length >= 50 ? current : { ...current, lines: [...current.lines, { ...emptyQuoteLine }] });
  }

  function removeQuoteLine(index: number) {
    setQuote((current) => ({
      ...current,
      lines: current.lines.length <= 1 ? current.lines : current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
  }

  async function run(action: string, task: () => Promise<unknown>, success: string) {
    if (busyAction) return;
    setBusyAction(action);
    setError(null);
    setMessage(null);
    try {
      await task();
      setMessage(success);
      router.refresh();
    } catch {
      setError("Action failed. Check staff permission, request status, or payload format.");
    } finally {
      setBusyAction(null);
    }
  }

  async function saveQuoteDraft() {
    if (!parsedQuote.success) {
      setMessage(null);
      setError("Quote draft is incomplete. Check model, quantity, currency, and field lengths.");
      return;
    }
    await run("quote", () => postJson(`/api/staff/inquiries/${inquiryId}/quote`, { payload: parsedQuote.data }), "Quote draft saved.");
  }

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <h2 className="text-lg font-semibold text-ink">Workbench actions</h2>
        {message ? <p className="mt-3 rounded-lg bg-accent-soft p-3 text-sm text-accent-dark" role="status">{message}</p> : null}
        {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={() => run("claim", () => postJson(`/api/staff/inquiries/${inquiryId}/claim`, {}), "Inquiry assigned to you.")}
          >
            Claim / assign self
          </Button>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold text-ink">Customer-visible status</h2>
        <p className="mt-1 text-sm leading-6 text-steel">Status changes are visible to the customer and can trigger a customer update.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor={`${idPrefix}-status`}>Customer-visible status</label>
          <select id={`${idPrefix}-status`} className="field" value={status} onChange={(event) => setStatus(event.target.value as StaffStatus)} disabled={isBusy}>
            {statuses.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}
          </select>
          <Button
            type="button"
            variant="accent"
            disabled={isBusy}
            onClick={() => run("status", () => postJson(`/api/staff/inquiries/${inquiryId}/status`, { status }), "Status saved; notification queued.")}
          >
            Save status
          </Button>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold text-ink">Public customer reply</h2>
        <p className="mt-1 text-sm leading-6 text-steel">This appears in the customer thread and can notify the customer.</p>
        <label className="mt-4 block text-sm font-medium text-ink" htmlFor={`${idPrefix}-public-reply`}>Reply text</label>
        <textarea
          id={`${idPrefix}-public-reply`}
          className="field mt-4 min-h-28"
          value={publicReply}
          onChange={(event) => setPublicReply(event.target.value)}
          placeholder="Reply visible to the customer."
          disabled={isBusy}
        />
        <div className="mt-4">
          <Button
            type="button"
            variant="accent"
            disabled={isBusy || !publicReply.trim()}
            onClick={() => run("reply", async () => {
              await postJson(`/api/staff/inquiries/${inquiryId}/reply`, { submissionKey: publicReplyKey, body: publicReply });
              setPublicReply("");
              setPublicReplyKey(newSubmissionKey());
            }, "Public reply saved; notification queued.")}
          >
            Save public reply
          </Button>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold text-ink">Internal note</h2>
        <p className="mt-1 text-sm leading-6 text-steel">Internal only. Not shown to customers and no customer notification is queued.</p>
        <label className="mt-4 block text-sm font-medium text-ink" htmlFor={`${idPrefix}-internal-note`}>Private note</label>
        <textarea
          id={`${idPrefix}-internal-note`}
          className="field mt-4 min-h-24"
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          placeholder="Private note for staff context."
          disabled={isBusy}
        />
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy || !internalNote.trim()}
            onClick={() => run("note", async () => {
              await postJson(`/api/staff/inquiries/${inquiryId}/note`, { body: internalNote });
              setInternalNote("");
            }, "Internal note saved.")}
          >
            Save internal note
          </Button>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold text-ink">Structured quote draft</h2>
        <p className="mt-1 text-sm leading-6 text-steel">
          Operators can save a draft. Managers can approve and publish a customer-visible quote.
          {isPublished ? " This quote has already been published and is read-only." : null}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-quote-currency`}>Currency</label>
            <input
              id={`${idPrefix}-quote-currency`}
              className="field mt-2"
              value={quote.currency}
              onChange={(event) => updateQuoteField("currency", event.target.value)}
              placeholder="EUR"
              disabled={isBusy || isPublished}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-quote-validity`}>Validity</label>
            <input
              id={`${idPrefix}-quote-validity`}
              className="field mt-2"
              value={quote.validity}
              onChange={(event) => updateQuoteField("validity", event.target.value)}
              placeholder="Valid for 30 days"
              disabled={isBusy || isPublished}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-quote-delivery`}>Delivery / freight terms</label>
            <input
              id={`${idPrefix}-quote-delivery`}
              className="field mt-2"
              value={quote.deliveryTerm}
              onChange={(event) => updateQuoteField("deliveryTerm", event.target.value)}
              placeholder="EXW, FOB, DAP..."
              disabled={isBusy || isPublished}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-quote-payment`}>Payment terms</label>
            <input
              id={`${idPrefix}-quote-payment`}
              className="field mt-2"
              value={quote.paymentTerm}
              onChange={(event) => updateQuoteField("paymentTerm", event.target.value)}
              placeholder="T/T, net terms..."
              disabled={isBusy || isPublished}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-quote-notes`}>Quote notes</label>
          <textarea
            id={`${idPrefix}-quote-notes`}
            className="field mt-2 min-h-24"
            value={quote.notes}
            onChange={(event) => updateQuoteField("notes", event.target.value)}
            placeholder="Customer-visible quote notes."
            disabled={isBusy || isPublished}
          />
        </div>
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">Quote lines</h3>
            <Button type="button" variant="secondary" size="sm" disabled={isBusy || isPublished || quote.lines.length >= 50} onClick={addQuoteLine}>
              Add line
            </Button>
          </div>
          {quote.lines.map((line, index) => (
            <fieldset key={index} className="rounded-lg border border-line bg-sand p-4">
              <legend className="px-1 text-sm font-semibold text-ink">Line {index + 1}</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-line-${index}-model`}>Model</label>
                  <input
                    id={`${idPrefix}-line-${index}-model`}
                    className="field mt-2"
                    value={line.model}
                    onChange={(event) => updateQuoteLine(index, "model", event.target.value)}
                    placeholder="EKD model"
                    disabled={isBusy || isPublished}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-line-${index}-quantity`}>Quantity</label>
                  <input
                    id={`${idPrefix}-line-${index}-quantity`}
                    className="field mt-2"
                    type="number"
                    min={1}
                    max={1_000_000}
                    step={1}
                    value={line.quantity}
                    onChange={(event) => updateQuoteLine(index, "quantity", Number.isFinite(event.target.valueAsNumber) ? Math.max(1, Math.trunc(event.target.valueAsNumber)) : 1)}
                    disabled={isBusy || isPublished}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-line-${index}-price`}>Unit price</label>
                  <input
                    id={`${idPrefix}-line-${index}-price`}
                    className="field mt-2"
                    value={line.unitPrice}
                    onChange={(event) => updateQuoteLine(index, "unitPrice", event.target.value)}
                    placeholder="12.34"
                    disabled={isBusy || isPublished}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-line-${index}-lead`}>Lead time</label>
                  <input
                    id={`${idPrefix}-line-${index}-lead`}
                    className="field mt-2"
                    value={line.leadTime}
                    onChange={(event) => updateQuoteLine(index, "leadTime", event.target.value)}
                    placeholder="2 weeks"
                    disabled={isBusy || isPublished}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-ink" htmlFor={`${idPrefix}-line-${index}-note`}>Line note</label>
                  <input
                    id={`${idPrefix}-line-${index}-note`}
                    className="field mt-2"
                    value={line.note}
                    onChange={(event) => updateQuoteLine(index, "note", event.target.value)}
                    placeholder="Optional customer-visible note"
                    disabled={isBusy || isPublished}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Button type="button" variant="secondary" size="sm" disabled={isBusy || isPublished || quote.lines.length <= 1} onClick={() => removeQuoteLine(index)}>
                  Remove line
                </Button>
              </div>
            </fieldset>
          ))}
        </div>
        {!quoteIsValid ? <p className="mt-3 text-sm text-red-700" role="alert">Complete required quote fields before saving.</p> : null}
        {isManager && !isPublished && quoteDirty ? (
          <p className="mt-3 text-sm text-steel">Save quote changes before approving or publishing, so the reviewed values match the database draft.</p>
        ) : null}
        {isManager && !isPublished && !hasPersistedDraft ? (
          <p className="mt-3 text-sm text-steel">Save a draft before approving or publishing.</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy || isPublished || !quoteIsValid}
            onClick={saveQuoteDraft}
          >
            Save draft
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy || !canApproveQuote}
            onClick={() => run("approve", () => postJson(`/api/staff/inquiries/${inquiryId}/quote`, { action: "approve" }), "Quote approved.")}
          >
            Approve quote
          </Button>
          <Button
            type="button"
            variant="accent"
            disabled={isBusy || !canPublishQuote}
            onClick={() => run("publish", () => postJson(`/api/staff/inquiries/${inquiryId}/quote`, { action: "publish" }), "Quote published; notification queued.")}
          >
            Publish quote
          </Button>
        </div>
      </section>
    </div>
  );
}
