import { createAuthClient, isAuthConfigured } from "@/lib/auth/supabase-server";
import { isVerifiedEmailUser } from "@/lib/auth/identity";
import { z } from "zod";

export function controlledDownloadsEnabled() { return process.env.CONTROLLED_DOWNLOADS_ENABLED === "true" && isAuthConfigured(); }
export async function listModelDownloads(modelId: string) {
  if (!controlledDownloadsEnabled()) return [];
  const client = await createAuthClient();
  if (!client) return [];
  const auth = await client.auth.getUser();
  if (auth.error || !isVerifiedEmailUser(auth.data.user)) return [];
  const { data, error } = await client.from("CatalogDownload").select("id,modelId,title,filename,format,byteSize").eq("modelId", modelId).order("createdAt");
  if (error) throw new Error("Downloads unavailable");
  return data ?? [];
}

export async function createModelDownload(id: string) {
  if (!controlledDownloadsEnabled()) return { status: 503 as const, error: "unavailable" };
  if (!z.uuid().safeParse(id).success) return { status: 404 as const, error: "not_found" };
  const client = await createAuthClient();
  if (!client) return { status: 503 as const, error: "unavailable" };
  const auth = await client.auth.getUser();
  if (auth.error || !isVerifiedEmailUser(auth.data.user)) return { status: 401 as const, error: "sign_in_required" };
  const record = await client.from("CatalogDownload").select("id,filename,bucketId,objectKey").eq("id", id).maybeSingle();
  if (record.error) return { status: 503 as const, error: "unavailable" };
  if (!record.data) return { status: 404 as const, error: "not_found" };
  const file = record.data;
  const signed = await client.storage.from(file.bucketId).createSignedUrl(file.objectKey, 60, { download: file.filename });
  if (signed.error || !signed.data?.signedUrl) return { status: 503 as const, error: "file_unavailable" };
  const log = await client.from("DownloadAccessLog").insert({ downloadId: file.id, userId: auth.data.user.id });
  if (log.error) return { status: 503 as const, error: "unavailable" };
  return { status: 200 as const, url: signed.data.signedUrl, expiresIn: 60 };
}
