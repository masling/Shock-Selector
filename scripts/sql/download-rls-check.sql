-- Run only against the dedicated Supabase development project after applying
-- 20260905035151_controlled_product_downloads.sql. All fixtures roll back.
-- This is metadata/RLS only: it does not create storage buckets or upload files.
begin;

do $$
declare
  verified_user uuid := gen_random_uuid();
  unverified_user uuid := gen_random_uuid();
  model_id text;
  approved_download_id uuid;
  rows_seen integer;
  denied boolean;
begin
  select m.id into model_id
  from public."ProductModel" m
  join public."ProductSeries" s on s.id = m."seriesId"
  join public."ProductFamily" f on f.id = s."familyId"
  where m."isActive" and m."catalogStatus" = 'PUBLISHED'
    and s."catalogStatus" = 'PUBLISHED'
    and f."isActive" and f."catalogStatus" = 'PUBLISHED'
  limit 1;
  if model_id is null then raise exception 'FAIL: no published product model available for download fixture'; end if;

  insert into auth.users (id, email, email_confirmed_at, is_anonymous, aud, role)
  values
    (verified_user, 'download-verified@example.invalid', now(), false, 'authenticated', 'authenticated'),
    (unverified_user, 'download-unverified@example.invalid', null, false, 'authenticated', 'authenticated');

  insert into public."CatalogDownload" ("modelId", title, filename, format, "byteSize", sha256, "objectKey", approved)
  values (model_id, 'Approved fixture PDF', 'approved-fixture.pdf', 'PDF', 12,
    repeat('a', 64), repeat('a', 64) || '.pdf', true)
  returning id into approved_download_id;
  insert into public."CatalogDownload" ("modelId", title, filename, format, "byteSize", sha256, "objectKey", approved)
  values (model_id, 'Unapproved fixture PDF', 'unapproved-fixture.pdf', 'PDF', 12,
    repeat('b', 64), repeat('b', 64) || '.pdf', false);

  perform set_config('request.jwt.claims', jsonb_build_object('sub', verified_user, 'email', 'download-verified@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into rows_seen from public."CatalogDownload";
  if rows_seen <> 1 then raise exception 'FAIL: verified customer should see exactly one approved published-model download, saw %', rows_seen; end if;

  denied := false;
  begin
    update public."CatalogDownload" set approved = false where id = approved_download_id;
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: customer changed approval state'; end if;

  denied := false;
  begin
    insert into storage.objects (bucket_id, name, owner, metadata)
    values ('ekd-model-files', repeat('c', 64) || '.pdf', verified_user, '{}'::jsonb);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: customer inserted storage object metadata'; end if;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', unverified_user, 'email', 'download-unverified@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into rows_seen from public."CatalogDownload";
  if rows_seen <> 0 then raise exception 'FAIL: unverified customer read download metadata'; end if;
  reset role;

  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  denied := false;
  begin perform 1 from public."CatalogDownload";
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: anonymous user read download metadata'; end if;
  reset role;
end;
$$;

rollback;
select 'PASS: download metadata RLS hides anonymous/unverified/unapproved rows, customers cannot approve or upload object metadata, fixtures rolled back' as result;
