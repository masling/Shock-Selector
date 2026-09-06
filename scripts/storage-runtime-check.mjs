import { createClient } from "@supabase/supabase-js";

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const [buckets, model] = await Promise.all([
  client.storage.listBuckets(),
  client.from("ProductModel").select("id,model,catalogStatus,isActive").eq("id", "cmq7qe9sr00wm1yqajju0cyz6").maybeSingle(),
]);
if (buckets.error) throw new Error(`Storage probe failed: ${buckets.error.name}`);
if (model.error) throw new Error(`Catalog probe failed: ${model.error.code}`);
if (model.data?.model !== "EK42x50" || model.data?.catalogStatus !== "PUBLISHED" || model.data?.isActive !== true) {
  throw new Error("Approved EK42x50 target is missing or unpublished");
}
console.log(JSON.stringify({
  projectRef: process.env.SUPABASE_PROJECT_REF,
  authenticatedAsServer: true,
  bucketCount: buckets.data.length,
  approvedTarget: { id: model.data.id, model: model.data.model, published: true },
  wroteData: false,
}));
