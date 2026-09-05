import { z } from "zod";
import { locales } from "@/lib/i18n/config";

export const inquiryItemSchema = z.object({
  model: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(1_000_000),
  note: z.string().trim().max(500).default(""),
}).strict();

export const createInquirySchema = z.object({
  submissionKey: z.uuid(),
  kind: z.enum(["standard", "replacement", "project"]),
  locale: z.enum(locales),
  contactName: z.string().trim().min(1).max(120),
  company: z.string().trim().max(200).default(""),
  country: z.string().trim().min(1).max(80),
  requestedDelivery: z.string().trim().max(120).default(""),
  message: z.string().trim().min(1).max(10000),
  originalModel: z.string().trim().max(200).default(""),
  items: z.array(inquiryItemSchema).max(50).default([]),
}).strict().superRefine((input, context) => {
  if (input.kind === "standard" && input.items.length === 0) context.addIssue({ code: "custom", path: ["items"], message: "Select at least one product." });
  if (input.kind === "replacement" && !input.originalModel) context.addIssue({ code: "custom", path: ["originalModel"], message: "Enter the original brand/model." });
  if (new Set(input.items.map((item) => item.model.toUpperCase())).size !== input.items.length) context.addIssue({ code: "custom", path: ["items"], message: "Combine duplicate models into one quantity." });
});

export const inquiryMessageSchema = z.object({ submissionKey: z.uuid(), body: z.string().trim().min(1).max(10000) }).strict();
export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type InquiryRecord = Omit<CreateInquiryInput, "submissionKey"> & {
  id: string; reference: string; status: string; email: string; createdAt: string; updatedAt: string;
};
export type InquiryMessageRecord = { id: string; inquiryId: string; authorRole: "customer" | "staff"; body: string; createdAt: string };
