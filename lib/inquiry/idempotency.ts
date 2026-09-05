import type { CreateInquiryInput, InquiryRecord } from "./schemas";

export class InquiryConflictError extends Error {}

export class InquiryPersistenceError extends Error {
  constructor(public readonly code: string) { super("Inquiry persistence failed"); }
}

export function matchesSubmittedInquiry(record: InquiryRecord, input: CreateInquiryInput) {
  const fields = ["kind", "locale", "contactName", "company", "country", "requestedDelivery", "message", "originalModel"] as const;
  return fields.every((field) => record[field] === input[field])
    && record.items.length === input.items.length
    && record.items.every((item, index) => {
      const candidate = input.items[index];
      return item.model === candidate.model && item.quantity === candidate.quantity && item.note === candidate.note;
    });
}
