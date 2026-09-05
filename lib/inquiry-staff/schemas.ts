import { z } from "zod";
import type { InquiryMessageRecord, InquiryRecord } from "@/lib/inquiry/schemas";

export const staffStatusSchema = z.enum(["received", "reviewing", "awaiting_customer", "quoted", "closed"]);

export const staffMessageSchema = z.object({
  submissionKey: z.uuid(),
  body: z.string().trim().min(1).max(10000),
}).strict();

export const internalNoteSchema = z.object({
  body: z.string().trim().min(1).max(10000),
}).strict();

export const quoteLineSchema = z.object({
  model: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
  unitPrice: z.string().trim().max(80).default(""),
  leadTime: z.string().trim().max(120).default(""),
  note: z.string().trim().max(500).default(""),
}).strict();

export const quoteDraftSchema = z.object({
  currency: z.string().trim().min(1).max(16).default("EUR"),
  validity: z.string().trim().max(120).default(""),
  deliveryTerm: z.string().trim().max(120).default(""),
  paymentTerm: z.string().trim().max(120).default(""),
  notes: z.string().trim().max(2000).default(""),
  lines: z.array(quoteLineSchema).min(1).max(50),
}).strict();

export type StaffStatus = z.infer<typeof staffStatusSchema>;
export type StaffMessageInput = z.infer<typeof staffMessageSchema>;
export type InternalNoteInput = z.infer<typeof internalNoteSchema>;
export type QuoteDraftInput = z.infer<typeof quoteDraftSchema>;

export type StaffRole = "operator" | "manager";

export type StaffListItem = Omit<InquiryRecord, "message"> & {
  assignedTo: string | null;
  staffRole: StaffRole;
};

export type StaffInquiryList = {
  items: StaffListItem[];
  total: number;
  page: number;
  staffRole: StaffRole;
};

export type StaffInternalNote = {
  id: string;
  inquiryId: string;
  staffUserId: string | null;
  body: string;
  createdAt: string;
};

export type StaffQuoteDraft = {
  id: string;
  inquiryId: string;
  staffUserId: string;
  payload: QuoteDraftInput;
  status: "draft" | "approved" | "published";
  approvedBy: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffPublishedQuote = {
  id: string;
  inquiryId: string;
  currency: string;
  validity: string;
  deliveryTerm: string;
  paymentTerm: string;
  notes: string;
  lines: QuoteDraftInput["lines"];
  publishedAt: string;
};

export type StaffInquiryDetail = {
  inquiry: InquiryRecord;
  assignment: { staffUserId: string; createdAt: string; updatedAt: string } | null;
  messages: InquiryMessageRecord[];
  internalNotes: StaffInternalNote[];
  quoteDraft: StaffQuoteDraft | null;
  publishedQuote: StaffPublishedQuote | null;
  staffRole: StaffRole;
};

export function isStaffRole(value: unknown): value is StaffRole {
  return value === "operator" || value === "manager";
}
