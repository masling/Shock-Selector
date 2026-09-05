export const inquiryStorageKey = "shock-selector-inquiry-items";

export type InquirySource = "engineer" | "buyer" | "product";

export type InquiryItem = {
  model: string;
  familySlug: string;
  familyName: string;
  seriesSlug: string;
  seriesName: string;
  source: InquirySource;
  variantKey?: string;
  inputSummary?: Record<string, unknown>;
  resultSummary?: Record<string, unknown>;
  filterSummary?: Record<string, unknown>;
  quantity: number;
  note: string;
  updatedAt: string;
};

export function readInquiryItems() {
  try {
    const storedItems = window.localStorage.getItem(inquiryStorageKey);
    if (!storedItems) return [];
    const parsedItems = JSON.parse(storedItems);
    if (!Array.isArray(parsedItems)) {
      return [];
    }

    return parsedItems.filter(isInquiryItem);
  } catch {
    return [];
  }
}

export function writeInquiryItems(items: InquiryItem[]) {
  window.localStorage.setItem(inquiryStorageKey, JSON.stringify(items));
}

export function upsertInquiryItem(item: Omit<InquiryItem, "quantity" | "note" | "updatedAt">) {
  const items = readInquiryItems();
  const existingIndex = items.findIndex((current) => current.model === item.model);
  const nextItem: InquiryItem = {
    ...item,
    quantity: existingIndex >= 0 ? items[existingIndex].quantity : 1,
    note: existingIndex >= 0 ? items[existingIndex].note : "",
    updatedAt: new Date().toISOString(),
  };

  const nextItems = existingIndex >= 0
    ? items.map((current, index) => (index === existingIndex ? nextItem : current))
    : [...items, nextItem];

  writeInquiryItems(nextItems);
  return nextItems;
}

export function removeInquiryItem(model: string) {
  const nextItems = readInquiryItems().filter((item) => item.model !== model);
  writeInquiryItems(nextItems);
  return nextItems;
}

export function updateInquiryItem(model: string, update: Pick<InquiryItem, "quantity" | "note">) {
  const nextItems = readInquiryItems().map((item) =>
    item.model === model
      ? { ...item, quantity: Math.max(1, update.quantity), note: update.note, updatedAt: new Date().toISOString() }
      : item,
  );
  writeInquiryItems(nextItems);
  return nextItems;
}

function isInquiryItem(item: unknown): item is InquiryItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<InquiryItem>;
  return typeof candidate.model === "string"
    && typeof candidate.familySlug === "string"
    && typeof candidate.seriesSlug === "string"
    && typeof candidate.seriesName === "string"
    && typeof candidate.source === "string";
}
