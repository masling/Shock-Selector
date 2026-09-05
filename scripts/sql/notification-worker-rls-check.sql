-- Run only against a dedicated Supabase development project after applying
-- the notification worker lease migration. All fixtures roll back.
begin;

do $$
declare
  inquiry_owner uuid := gen_random_uuid();
  inquiry_id uuid;
  job_id uuid;
  token_a uuid;
  token_b uuid;
  denied boolean;
  claimed jsonb;
  job_status text;
  delivery_count integer;
begin
  insert into auth.users (id, email, email_confirmed_at, is_anonymous, aud, role)
  values (inquiry_owner, 'notification-worker-owner@example.invalid', now(), false, 'authenticated', 'authenticated');

  perform set_config('request.jwt.claims', jsonb_build_object('sub', inquiry_owner, 'email', 'notification-worker-owner@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message)
    values (inquiry_owner, gen_random_uuid(), 'project', 'en', 'Worker fixture', 'notification-worker-owner@example.invalid', 'Germany', 'Notification worker fixture')
    returning id into inquiry_id;
  reset role;

  select id into job_id from inquiry_private."NotificationJob" where "inquiryId" = inquiry_id order by "createdAt" limit 1;
  if job_id is null then raise exception 'FAIL: no notification job queued'; end if;

  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  denied := false;
  begin perform public.notification_claim_jobs(1, 'anon-fixture', 60);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: anon claimed notification job'; end if;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', inquiry_owner, 'role', 'authenticated')::text, true);
  set local role authenticated;
  denied := false;
  begin perform public.notification_claim_jobs(1, 'authenticated-fixture', 60);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: authenticated user claimed notification job'; end if;
  reset role;

  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  set local role service_role;
  select leased.job into claimed from public.notification_claim_jobs(1, 'worker-a', 60) as leased(job);
  token_a := (claimed->>'leaseToken')::uuid;
  if token_a is null or claimed->>'id' <> job_id::text then raise exception 'FAIL: service role did not lease expected job'; end if;
  reset role;

  update inquiry_private."NotificationJob" set "leaseExpiresAt" = now() - interval '1 second' where id = job_id;

  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  set local role service_role;
  select leased.job into claimed from public.notification_claim_jobs(1, 'worker-b', 60) as leased(job);
  token_b := (claimed->>'leaseToken')::uuid;
  if token_b is null or token_b = token_a then raise exception 'FAIL: expired lease was not reclaimed with new token'; end if;

  denied := false;
  begin perform public.notification_finish_job(job_id, token_a, '[{"channel":"customer_email","status":"accepted","providerId":"old"}]'::jsonb);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: stale lease token finished job'; end if;

  perform public.notification_finish_job(job_id, token_b, '[{"channel":"customer_email","status":"accepted","providerId":"smtp-fixture"}]'::jsonb);
  reset role;

  select status into job_status from inquiry_private."NotificationJob" where id = job_id;
  if job_status <> 'sent' then raise exception 'FAIL: accepted channel did not finish job, status %', job_status; end if;
  select count(*) into delivery_count from inquiry_private."NotificationDelivery" where "jobId" = job_id and channel = 'customer_email' and status = 'accepted';
  if delivery_count <> 1 then raise exception 'FAIL: accepted channel delivery state missing'; end if;
end;
$$;

rollback;
select 'PASS: notification worker RPCs are service-role only, SKIP LOCKED leases are token-bound, stale leases cannot finish, channel delivery state persists, fixtures rolled back' as result;
