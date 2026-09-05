import { createAuthClient } from "@/lib/auth/supabase-server";
import { isVerifiedEmailUser } from "@/lib/auth/identity";
import type { StaffInquiryDetail, StaffInquiryList, StaffMessageInput, StaffPublishedQuote, StaffStatus, QuoteDraftInput } from "./schemas";

type StaffSession = {
  userId: string;
  role: "operator" | "manager";
  repository: ReturnType<typeof staffInquiryRepository>;
};

function assertRpcData<T>(data: T | null, error: { message?: string } | null) {
  if (error) throw new Error("Staff inquiry RPC failed");
  if (!data) throw new Error("Staff inquiry RPC returned no data");
  return data;
}

export async function getStaffInquirySession(): Promise<StaffSession | null> {
  const authClient = await createAuthClient();
  if (!authClient) return null;

  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !isVerifiedEmailUser(authData.user)) return null;

  const { data, error } = await authClient.rpc("staff_current_member");
  if (error || !data || typeof data !== "object") return null;
  const role = (data as { role?: unknown }).role;
  if (role !== "operator" && role !== "manager") return null;

  return {
    userId: authData.user.id,
    role,
    repository: staffInquiryRepository(authClient),
  };
}

export function staffInquiryRepository(client: Awaited<ReturnType<typeof createAuthClient>>) {
  if (!client) throw new Error("Staff auth client is not configured");

  return {
    async list(page: number, status?: StaffStatus) {
      const { data, error } = await client.rpc("staff_list_inquiries", {
        p_page: page,
        p_status: status ?? null,
      });
      return assertRpcData(data as StaffInquiryList | null, error);
    },

    async detail(id: string) {
      const { data, error } = await client.rpc("staff_inquiry_detail", { inquiry_id: id });
      return assertRpcData(data as StaffInquiryDetail | null, error);
    },

    async claim(id: string) {
      const { data, error } = await client.rpc("staff_claim_inquiry", { inquiry_id: id });
      return assertRpcData(data as { inquiryId: string; staffUserId: string; updatedAt: string } | null, error);
    },

    async updateStatus(id: string, status: StaffStatus) {
      const { data, error } = await client.rpc("staff_update_inquiry_status", {
        inquiry_id: id,
        next_status: status,
      });
      return assertRpcData(data as { id: string; reference: string; status: StaffStatus; updatedAt: string } | null, error);
    },

    async addPublicReply(id: string, input: StaffMessageInput) {
      const { data, error } = await client.rpc("staff_add_public_reply", {
        inquiry_id: id,
        submission_key: input.submissionKey,
        body: input.body,
      });
      return assertRpcData(data as { id: string; inquiryId: string; authorRole: "staff"; body: string; createdAt: string } | null, error);
    },

    async addInternalNote(id: string, body: string) {
      const { data, error } = await client.rpc("staff_add_internal_note", { inquiry_id: id, body });
      return assertRpcData(data as { id: string; inquiryId: string; staffUserId: string; body: string; createdAt: string } | null, error);
    },

    async saveQuoteDraft(id: string, quotePayload: QuoteDraftInput) {
      const { data, error } = await client.rpc("staff_save_quote_draft", {
        inquiry_id: id,
        quote_payload: quotePayload,
      });
      return assertRpcData(data as { id: string; inquiryId: string; status: string; updatedAt: string } | null, error);
    },

    async approveQuote(id: string) {
      const { data, error } = await client.rpc("staff_approve_quote", { inquiry_id: id });
      return assertRpcData(data as { id: string; inquiryId: string; status: "approved"; approvedAt: string } | null, error);
    },

    async publishQuote(id: string) {
      const { data, error } = await client.rpc("staff_publish_quote", { inquiry_id: id });
      return assertRpcData(data as StaffPublishedQuote | null, error);
    },
  };
}
