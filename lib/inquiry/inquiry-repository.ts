import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateInquiryInput, InquiryRecord, InquiryMessageRecord } from "./schemas";
import { InquiryConflictError, InquiryPersistenceError, matchesSubmittedInquiry } from "./idempotency";

const fields = "id,reference,kind,status,locale,contactName,email,company,country,requestedDelivery,message,originalModel,items,createdAt,updatedAt";
const messageFields = "id,inquiryId,authorRole,body,createdAt";
const publishedQuoteFields = "id,inquiryId,currency,validity,deliveryTerm,paymentTerm,notes,lines,publishedAt";

export type PublishedInquiryQuote = {
  id: string;
  inquiryId: string;
  currency: string;
  validity: string;
  deliveryTerm: string;
  paymentTerm: string;
  notes: string;
  lines: Array<{ model: string; quantity: number; unitPrice?: string; leadTime?: string; note?: string }>;
  publishedAt: string;
};

// Always use a per-request, user-session client. Never substitute a service key.
export function inquiryRepository(client: SupabaseClient) {
  return {
    async list(userId: string, page: number) {
      const { data, error, count } = await client.from("CustomerInquiry").select(fields, { count: "exact" }).eq("userId", userId).order("createdAt", { ascending: false }).range((page - 1) * 20, page * 20 - 1);
      if (error) throw new Error("Inquiry list unavailable");
      return { items: (data ?? []) as InquiryRecord[], total: count ?? 0 };
    },
    async detail(userId: string, id: string) {
      const { data, error } = await client.from("CustomerInquiry").select(fields).eq("userId", userId).eq("id", id).maybeSingle();
      if (error) throw new Error("Inquiry unavailable");
      if (!data) return null;
      const messages = await client.from("InquiryMessage").select(messageFields).eq("inquiryId", id).order("createdAt", { ascending: false }).limit(100);
      if (messages.error) throw new Error("Messages unavailable");
      const publishedQuote = await client.from("PublishedInquiryQuote").select(publishedQuoteFields).eq("inquiryId", id).maybeSingle();
      if (publishedQuote.error && publishedQuote.error.code !== "PGRST116") throw new Error("Published quote unavailable");
      return {
        inquiry: data as InquiryRecord,
        messages: (messages.data ?? []).reverse() as InquiryMessageRecord[],
        publishedQuote: (publishedQuote.data ?? null) as PublishedInquiryQuote | null,
      };
    },
    async create(userId: string, email: string, input: CreateInquiryInput) {
      const { data, error } = await client.from("CustomerInquiry").insert({ ...input, userId, email }).select(fields).single();
      if (!error) return { inquiry: data as InquiryRecord, created: true };
      if (error.code === "23505") {
        const existing = await client.from("CustomerInquiry").select(fields).eq("userId", userId).eq("submissionKey", input.submissionKey).maybeSingle();
        if (!existing.error && existing.data) {
          if (!matchesSubmittedInquiry(existing.data as InquiryRecord, input)) throw new InquiryConflictError("This submission key already saved a different request");
          return { inquiry: existing.data as InquiryRecord, created: false };
        }
      }
      throw new InquiryPersistenceError(error.code || "unknown_database_error");
    },
    async message(userId: string, inquiryId: string, input: { submissionKey: string; body: string }) {
      const { data, error } = await client.from("InquiryMessage").insert({ ...input, inquiryId, authorId: userId }).select(messageFields).single();
      if (!error) return data as InquiryMessageRecord;
      if (error.code === "23505") {
        const existing = await client.from("InquiryMessage").select(messageFields).eq("authorId", userId).eq("submissionKey", input.submissionKey).eq("inquiryId", inquiryId).maybeSingle();
        if (!existing.error && existing.data) {
          if (existing.data.body !== input.body) throw new InquiryConflictError("This submission key already saved a different message");
          return existing.data as InquiryMessageRecord;
        }
      }
      throw new InquiryPersistenceError(error.code || "unknown_database_error");
    },
  };
}
