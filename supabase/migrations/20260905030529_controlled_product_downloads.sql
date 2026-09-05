-- Approved model files live in a PRIVATE bucket created through Storage API/UI.
-- This migration does not copy any source material or make the bucket public.
create table public."CatalogDownload" (
  id uuid primary key default gen_random_uuid(),
  "modelId" text not null references public."ProductModel"(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  filename text not null check (filename ~ '^[A-Za-z0-9][A-Za-z0-9_.()-]{0,150}\.(pdf|dwg|step|stp)$'),
  format text not null check (format in ('PDF','DWG','STEP')),
  "byteSize" bigint not null check ("byteSize" between 1 and 26214400),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  "bucketId" text not null default 'ekd-model-files' check ("bucketId" = 'ekd-model-files'),
  "objectKey" text not null unique check ("objectKey" ~ '^[a-f0-9]{64}\.(pdf|dwg|step|stp)$'),
  approved boolean not null default false,
  "createdAt" timestamptz not null default now()
);
create index "CatalogDownload_modelId_idx" on public."CatalogDownload" ("modelId");
alter table public."CatalogDownload" enable row level security;
revoke all on public."CatalogDownload" from public, anon, authenticated;
grant select on public."CatalogDownload" to authenticated;

create function inquiry_private.download_model_is_published(model_id text) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (select 1 from public."ProductModel" m
    join public."ProductSeries" s on s.id = m."seriesId"
    join public."ProductFamily" f on f.id = s."familyId"
    where m.id = model_id and m."isActive" and m."catalogStatus" = 'PUBLISHED'
      and s."catalogStatus" = 'PUBLISHED' and f."isActive" and f."catalogStatus" = 'PUBLISHED');
$$;
revoke all on function inquiry_private.download_model_is_published(text) from public, anon;
grant execute on function inquiry_private.download_model_is_published(text) to authenticated;
create policy published_download_metadata on public."CatalogDownload" for select to authenticated
  using (approved and (select inquiry_private.verified_customer()) and inquiry_private.download_model_is_published("modelId"));

create policy verified_model_file_read on storage.objects for select to authenticated
  using (bucket_id = 'ekd-model-files' and (select inquiry_private.verified_customer())
    and exists (select 1 from public."CatalogDownload" d where d."bucketId" = bucket_id and d."objectKey" = name));

create table public."DownloadAccessLog" (
  id uuid primary key default gen_random_uuid(),
  "downloadId" uuid not null references public."CatalogDownload"(id) on delete restrict,
  "userId" uuid not null references auth.users(id) on delete restrict,
  "createdAt" timestamptz not null default now()
);
create index "DownloadAccessLog_downloadId_idx" on public."DownloadAccessLog" ("downloadId");
create index "DownloadAccessLog_userId_createdAt_idx" on public."DownloadAccessLog" ("userId", "createdAt");
alter table public."DownloadAccessLog" enable row level security;
revoke all on public."DownloadAccessLog" from public, anon, authenticated;
grant insert ("downloadId", "userId") on public."DownloadAccessLog" to authenticated;
create policy record_own_download on public."DownloadAccessLog" for insert to authenticated
  with check ("userId" = (select auth.uid()) and (select inquiry_private.verified_customer())
    and exists (select 1 from public."CatalogDownload" d where d.id = "downloadId"));
