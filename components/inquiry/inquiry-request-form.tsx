"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { InquiryPortalCopy } from "@/lib/i18n/inquiry-portal-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { inquiryStorageKey, readInquiryItems, writeInquiryItems, type InquiryItem } from "@/lib/inquiry/inquiry-storage";
import type { CreateInquiryInput, InquiryRecord } from "@/lib/inquiry/schemas";

type InquiryKind = CreateInquiryInput["kind"];
type DraftItem = Pick<InquiryItem, "model" | "quantity" | "note">;

type InquiryRequestFormProps = {
  locale: Locale;
  copy: InquiryPortalCopy;
  signedIn: boolean;
  portalEnabled: boolean;
  serviceEmail: string;
  whatsappHref: string;
  initialModels?: string[];
  initialKind?: InquiryKind;
};

type DraftState = {
  submissionKey: string;
  kind: InquiryKind;
  contactName: string;
  company: string;
  country: string;
  requestedDelivery: string;
  originalModel: string;
  message: string;
  items: DraftItem[];
};

type DraftTextField = "contactName" | "company" | "country" | "requestedDelivery" | "originalModel" | "message";
type SaveState = { status: "idle" | "saving" | "saved" | "failed"; inquiry?: InquiryRecord };

const draftStorageKey = "ekd-customer-inquiry-draft:v1";
const inquiryKindSchema = z.enum(["standard", "replacement", "project"]);
const draftText = (maxLength: number) =>
  z.preprocess((value) => typeof value === "string" ? value : "", z.string().trim().max(maxLength));
const storedDraftSchema = z.object({
  submissionKey: z.uuid().optional(),
  kind: inquiryKindSchema.catch("project"),
  contactName: draftText(120),
  company: draftText(200),
  country: draftText(80),
  requestedDelivery: draftText(120),
  originalModel: draftText(200),
  message: draftText(10000),
  items: z.array(z.object({
    model: z.string().trim().min(1).max(120),
    quantity: z.coerce.number().int().min(1).max(1_000_000),
    note: draftText(500),
  }).strict()).max(50).catch([]),
}).strict();

function newSubmissionKey() {
  const browserCrypto = globalThis.crypto;

  if (browserCrypto?.randomUUID) {
    return browserCrypto.randomUUID();
  }

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

function cleanModels(models: string[] | undefined) {
  return Array.from(new Set((models ?? []).map((model) => model.trim()).filter(Boolean))).slice(0, 50);
}

function toDraftItems(models: string[], savedItems: DraftItem[], cartItems: InquiryItem[]) {
  const savedByModel = new Map(savedItems.map((item) => [item.model.toUpperCase(), item]));
  const cartByModel = new Map(cartItems.map((item) => [item.model.toUpperCase(), item]));

  return models.map((model) => {
    const saved = savedByModel.get(model.toUpperCase());
    const cart = cartByModel.get(model.toUpperCase());

    return {
      model,
      quantity: Math.max(1, Number(saved?.quantity ?? cart?.quantity ?? 1)),
      note: saved?.note ?? cart?.note ?? "",
    };
  });
}

function readDraft(): Partial<DraftState> | null {
  try {
    const rawDraft = window.sessionStorage.getItem(draftStorageKey);
    if (!rawDraft) return null;
    const parsedDraft = storedDraftSchema.safeParse(JSON.parse(rawDraft));
    return parsedDraft.success ? parsedDraft.data : null;
  } catch {
    return null;
  }
}

function initialDraft(locale: Locale, initialKind: InquiryKind | undefined, initialModels: string[] | undefined): DraftState {
  const models = cleanModels(initialModels);
  return {
    submissionKey: newSubmissionKey(),
    kind: initialKind ?? (models.length ? "standard" : "project"),
    contactName: "",
    company: "",
    country: "",
    requestedDelivery: "",
    originalModel: "",
    message: "",
    items: models.map((model) => ({ model, quantity: 1, note: "" })),
  };
}

function emptyDraft(kind: InquiryKind | undefined): DraftState {
  return {
    submissionKey: newSubmissionKey(),
    kind: kind ?? "project",
    contactName: "",
    company: "",
    country: "",
    requestedDelivery: "",
    originalModel: "",
    message: "",
    items: [],
  };
}

function hasDraftContent(draft: DraftState) {
  return Boolean(
    draft.contactName.trim() ||
      draft.company.trim() ||
      draft.country.trim() ||
      draft.requestedDelivery.trim() ||
      draft.originalModel.trim() ||
      draft.message.trim() ||
      draft.items.length,
  );
}

function validateDraft(draft: DraftState) {
  if (!draft.contactName.trim() || !draft.country.trim() || !draft.message.trim()) return false;
  if (draft.kind === "standard" && draft.items.length === 0) return false;
  if (draft.kind === "replacement" && !draft.originalModel.trim()) return false;
  return draft.items.every((item) => item.model.trim() && Number.isInteger(item.quantity) && item.quantity > 0);
}

export function InquiryRequestForm({
  locale,
  copy,
  signedIn,
  portalEnabled,
  serviceEmail,
  whatsappHref,
  initialModels,
  initialKind,
}: InquiryRequestFormProps) {
  const [draft, setDraft] = useState(() => initialDraft(locale, initialKind, initialModels));
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const hasInitialModels = cleanModels(initialModels).length > 0;

  useEffect(() => {
    const storedDraft = readDraft();
    const cartItems = readInquiryItems();
    const cartModels = cartItems.map((item) => item.model);
    const selectedModels = hasInitialModels ? cleanModels(initialModels) : cleanModels(storedDraft?.items?.map((item) => item.model) ?? cartModels);
    const items = selectedModels.length
      ? toDraftItems(selectedModels, storedDraft?.items ?? [], cartItems)
      : [];

    setDraft((current) => ({
      ...current,
      submissionKey: storedDraft?.submissionKey || current.submissionKey,
      kind: initialKind ?? storedDraft?.kind ?? (items.length ? "standard" : "project"),
      contactName: storedDraft?.contactName ?? current.contactName,
      company: storedDraft?.company ?? current.company,
      country: storedDraft?.country ?? current.country,
      requestedDelivery: storedDraft?.requestedDelivery ?? current.requestedDelivery,
      originalModel: storedDraft?.originalModel ?? current.originalModel,
      message: storedDraft?.message ?? current.message,
      items,
    }));
    setHydrated(true);
  }, [hasInitialModels, initialKind, initialModels]);

  useEffect(() => {
    if (!hydrated) return;
    if (saveState.status === "saved") return;

    try {
      if (hasDraftContent(draft)) {
        window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
      } else {
        window.sessionStorage.removeItem(draftStorageKey);
      }
    } catch {
      // Draft persistence is best-effort only.
    }
  }, [draft, hydrated, saveState.status]);

  const selectedSourceText = useMemo(() => {
    if (hasInitialModels) return copy.selectedFromQuery;
    return draft.items.length ? copy.selectedFromCart : copy.noItems;
  }, [copy.noItems, copy.selectedFromCart, copy.selectedFromQuery, draft.items.length, hasInitialModels]);

  function setField(field: DraftTextField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function setKind(kind: InquiryKind) {
    setDraft((current) => ({ ...current, kind }));
    setError(null);
  }

  function updateItem(index: number, update: Partial<DraftItem>) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...update,
              quantity: Math.max(1, Number(update.quantity ?? item.quantity)),
            }
          : item,
      ),
    }));
  }

  function removeItem(index: number) {
    setDraft((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function persistAndSignIn() {
    try {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch {
      // Continue to sign-in even if storage is unavailable.
    }

    window.location.assign(getLocalizedHref(locale, `/sign-in?next=${encodeURIComponent(`/${locale}/account/inquiries/new`)}`));
  }

  function clearDraft() {
    const nextDraft = emptyDraft(initialKind);
    setDraft(nextDraft);
    setError(null);
    setSaveState({ status: "idle" });
    try {
      window.sessionStorage.removeItem(draftStorageKey);
    } catch {
      // Nothing else to clear.
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validateDraft(draft)) {
      setError(copy.missingFields);
      return;
    }

    if (!signedIn) {
      persistAndSignIn();
      return;
    }

    const payload: CreateInquiryInput = {
      submissionKey: draft.submissionKey,
      kind: draft.kind,
      locale,
      contactName: draft.contactName,
      company: draft.company,
      country: draft.country,
      requestedDelivery: draft.requestedDelivery,
      originalModel: draft.originalModel,
      message: draft.message,
      items: draft.items.map((item) => ({
        model: item.model,
        quantity: item.quantity,
        note: item.note,
      })),
    };

    setSaveState({ status: "saving" });
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        persistAndSignIn();
        return;
      }

      if (!response.ok) {
        setError(copy.failure);
        setSaveState({ status: "failed" });
        return;
      }

      const result = await response.json() as { inquiry: InquiryRecord };
      setSaveState({ status: "saved", inquiry: result.inquiry });
      setDraft(emptyDraft(initialKind));
      try {
        window.sessionStorage.removeItem(draftStorageKey);
        window.localStorage.removeItem(inquiryStorageKey);
        writeInquiryItems([]);
      } catch {
        // Request was already persisted; clearing local convenience storage is best-effort.
      }
    } catch {
      setError(copy.failure);
      setSaveState({ status: "failed" });
    }
  }

  if (!portalEnabled) {
    return (
      <section className="surface p-6">
        <h2 className="text-xl font-semibold text-ink">{copy.unavailableTitle}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.unavailable}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className={buttonVariants({ variant: "accent" })} href={`mailto:${serviceEmail}`}>
            {copy.email}
          </a>
          <a className={buttonVariants({ variant: "secondary" })} href={whatsappHref}>
            {copy.whatsapp}
          </a>
        </div>
      </section>
    );
  }

  if (saveState.status === "saved" && saveState.inquiry) {
    return (
      <section className="surface p-6">
        <h2 className="text-xl font-semibold text-ink">{copy.savedTitle}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.saved}</p>
        <p className="mt-3 text-sm text-steel">{copy.reference}: <span className="font-medium text-ink">{saveState.inquiry.reference}</span></p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className={buttonVariants({ variant: "accent" })} href={getLocalizedHref(locale, `/account/inquiries/${saveState.inquiry.id}`)}>
            {copy.viewSaved}
          </Link>
          <Link className={buttonVariants({ variant: "secondary" })} href={getLocalizedHref(locale, "/account/inquiries")}>
            {copy.history}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="surface p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">{copy.kind}</h2>
            <p className="mt-1 text-sm leading-6 text-steel">{copy.intro}</p>
          </div>
          <button type="button" className="text-left text-sm font-semibold text-accent-dark" onClick={clearDraft}>
            {copy.clearDraft}
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(["standard", "replacement", "project"] as InquiryKind[]).map((kind) => (
            <label
              key={kind}
              className={`cursor-pointer rounded-lg border p-4 text-sm transition-colors ${
                draft.kind === kind ? "border-accent bg-accent-soft text-accent-dark" : "border-line bg-white text-steel hover:border-accent"
              }`}
            >
              <input className="sr-only" type="radio" name="kind" checked={draft.kind === kind} onChange={() => setKind(kind)} />
              <span className="font-semibold text-ink">{copy[kind]}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold text-ink">{copy.contactDetails}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="field-label">{copy.name}</span>
            <input className="field" value={draft.contactName} required onChange={(event) => setField("contactName", event.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">{copy.country}</span>
            <input className="field" value={draft.country} required onChange={(event) => setField("country", event.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">{copy.company}</span>
            <input className="field" value={draft.company} onChange={(event) => setField("company", event.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">{copy.delivery}</span>
            <input className="field" value={draft.requestedDelivery} onChange={(event) => setField("requestedDelivery", event.target.value)} />
          </label>
        </div>
      </section>

      {draft.kind === "replacement" ? (
        <section className="surface p-5">
          <label className="block">
            <span className="field-label">{copy.originalModel}</span>
            <input className="field" value={draft.originalModel} required onChange={(event) => setField("originalModel", event.target.value)} />
          </label>
          <p className="mt-2 text-sm leading-6 text-steel">{copy.originalModelHelp}</p>
        </section>
      ) : null}

      <section className="surface p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">{copy.items}</h2>
            <p className="mt-1 text-sm leading-6 text-steel">{selectedSourceText}</p>
          </div>
          <Link className="text-sm font-semibold text-accent-dark" href={getLocalizedHref(locale, "/products")}>
            {copy.addFromCatalog}
          </Link>
        </div>
        {draft.items.length ? (
          <div className="mt-4 space-y-3">
            {draft.items.map((item, index) => (
              <div key={item.model} className="grid gap-3 rounded-lg border border-line bg-sand p-3 md:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)_auto] md:items-end">
                <div>
                  <span className="field-label">{copy.model}</span>
                  <p className="min-h-11 rounded-md border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink">{item.model}</p>
                </div>
                <label>
                  <span className="field-label">{copy.quantity}</span>
                  <input className="field" type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} />
                </label>
                <label>
                  <span className="field-label">{copy.itemNote}</span>
                  <input className="field" value={item.note} onChange={(event) => updateItem(index, { note: event.target.value })} />
                </label>
                <button type="button" className="min-h-11 text-sm font-semibold text-steel hover:text-accent-dark" onClick={() => removeItem(index)}>
                  {copy.remove}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-line bg-sand p-4 text-sm leading-6 text-steel">{copy.noItems}</p>
        )}
      </section>

      <section className="surface p-5">
        <label className="block">
          <span className="field-label">{copy.message}</span>
          <textarea
            className="field min-h-40"
            required
            value={draft.message}
            onChange={(event) => setField("message", event.target.value)}
            placeholder={copy.messagePlaceholder}
          />
        </label>
      </section>

      <div className="surface p-5">
        <p className="text-sm leading-6 text-steel">{signedIn ? copy.signedInNotice : copy.signInDescription}</p>
        <p className="mt-2 text-xs leading-5 text-steel">{copy.draftStorage}</p>
        {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="submit" variant="accent" disabled={saveState.status === "saving"}>
            {saveState.status === "saving" ? copy.submitting : signedIn ? copy.submit : copy.signIn}
          </Button>
          <a className={buttonVariants({ variant: "secondary" })} href={`mailto:${serviceEmail}`}>
            {copy.email}
          </a>
        </div>
      </div>
    </form>
  );
}
