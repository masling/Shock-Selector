import { createAuthClient, isAuthConfigured } from "@/lib/auth/supabase-server";
import { isVerifiedEmailUser } from "@/lib/auth/identity";
import { prisma } from "@/lib/prisma";
import { publishedModelWhere } from "@/lib/catalog/catalog-visibility";
import { inquiryRepository } from "./inquiry-repository";
import type { CreateInquiryInput } from "./schemas";

export function isInquiryPortalEnabled() {
  return process.env.INQUIRY_PORTAL_ENABLED === "true" && isAuthConfigured();
}

export async function getInquirySession() {
  if (!isInquiryPortalEnabled()) return null;
  const client = await createAuthClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !isVerifiedEmailUser(data.user)) return null;
  return { user: data.user, repository: inquiryRepository(client) };
}

export async function validateInquiryModels(input: CreateInquiryInput) {
  if (!input.items.length) return true;
  const rows = await prisma.productModel.findMany({
    where: { ...publishedModelWhere(), model: { in: input.items.map((item) => item.model) } },
    select: { model: true },
  });
  const available = new Set(rows.map((row) => row.model));
  return input.items.every((item) => available.has(item.model));
}
