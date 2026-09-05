-- Durable notification delivery worker foundation.
-- Local migration only until explicitly reviewed/applied to a non-production project.

alter table inquiry_private."NotificationJob"
  add column if not exists "leaseToken" uuid,
  add column if not exists "leasedBy" text check ("leasedBy" is null or char_length("leasedBy") <= 120),
  add column if not exists "leaseExpiresAt" timestamptz,
  add column if not exists "nextAttemptAt" timestamptz not null default now(),
  add column if not exists "lastError" text check ("lastError" is null or char_length("lastError") <= 200),
  add column if not exists "finishedAt" timestamptz;

alter table inquiry_private."NotificationJob"
  drop constraint if exists "NotificationJob_status_check";
alter table inquiry_private."NotificationJob"
  add constraint "NotificationJob_status_check"
  check (status in ('pending', 'processing', 'sent', 'failed', 'deferred'));

create index if not exists "NotificationJob_worker_claim_idx"
  on inquiry_private."NotificationJob" ("nextAttemptAt", "createdAt")
  where status in ('pending', 'processing');

create table if not exists inquiry_private."NotificationDelivery" (
  id uuid primary key default gen_random_uuid(),
  "jobId" uuid not null references inquiry_private."NotificationJob"(id) on delete cascade,
  channel text not null check (channel in ('customer_email', 'staff_email', 'feishu')),
  status text not null check (status in ('accepted', 'deferred', 'failed', 'uncertain', 'skipped')),
  attempts integer not null default 0 check (attempts >= 0),
  retryable boolean not null default false,
  "providerId" text check ("providerId" is null or char_length("providerId") <= 240),
  "errorCode" text check ("errorCode" is null or char_length("errorCode") <= 120),
  "acceptedAt" timestamptz,
  "updatedAt" timestamptz not null default now(),
  unique ("jobId", channel)
);
create index if not exists "NotificationDelivery_job_idx" on inquiry_private."NotificationDelivery" ("jobId");
alter table inquiry_private."NotificationDelivery" enable row level security;
revoke all on inquiry_private."NotificationDelivery" from public, anon, authenticated;

grant usage on schema inquiry_private to service_role;

create or replace function inquiry_private.require_notification_service_role()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb;
begin
  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  if coalesce(claims->>'role', '') <> 'service_role' then
    raise exception 'Notification worker requires service role' using errcode = '42501';
  end if;
end;
$$;
revoke all on function inquiry_private.require_notification_service_role() from public, anon, authenticated, service_role;
grant execute on function inquiry_private.require_notification_service_role() to service_role;

create or replace function inquiry_private.notification_claim_jobs(
  p_claim_limit integer,
  p_worker_id text,
  p_lease_seconds integer
)
returns table(job jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  effective_limit integer := least(greatest(coalesce(p_claim_limit, 10), 1), 25);
  effective_worker_id text := left(coalesce(nullif(p_worker_id, ''), 'notification-worker'), 120);
  effective_lease_seconds integer := least(greatest(coalesce(p_lease_seconds, 300), 60), 900);
begin
  perform inquiry_private.require_notification_service_role();

  return query
  with picked as (
    select nj.id
    from inquiry_private."NotificationJob" nj
    where nj.status in ('pending', 'processing')
      and coalesce(nj."nextAttemptAt", nj."createdAt") <= now()
      and nj.attempts < 6
      and (
        nj.status = 'pending'
        or (nj.status = 'processing' and nj."leaseExpiresAt" < now())
      )
    order by nj."createdAt"
    limit effective_limit
    for update skip locked
  ),
  leased as (
    update inquiry_private."NotificationJob" nj
    set status = 'processing',
      attempts = nj.attempts + 1,
      "leaseToken" = gen_random_uuid(),
      "leasedBy" = effective_worker_id,
      "leaseExpiresAt" = now() + make_interval(secs => effective_lease_seconds),
      "lastError" = null
    from picked
    where nj.id = picked.id
    returning nj.*
  )
  select jsonb_build_object(
    'id', leased.id,
    'inquiryId', leased."inquiryId",
    'eventKey', leased."eventKey",
    'kind', leased.kind,
    'attempts', leased.attempts,
    'leaseToken', leased."leaseToken",
    'reference', ci.reference,
    'locale', ci.locale,
    'customer', jsonb_build_object('email', ci.email, 'name', ci."contactName"),
    'deliveries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'channel', nd.channel,
        'status', nd.status,
        'providerId', nd."providerId",
        'errorCode', nd."errorCode"
      ) order by nd.channel)
      from inquiry_private."NotificationDelivery" nd
      where nd."jobId" = leased.id
    ), '[]'::jsonb)
  )
  from leased
  join public."CustomerInquiry" ci on ci.id = leased."inquiryId"
  order by leased."createdAt";
end;
$$;
revoke all on function inquiry_private.notification_claim_jobs(integer, text, integer) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.notification_claim_jobs(integer, text, integer) to service_role;

create or replace function inquiry_private.notification_finish_job(
  p_job_id uuid,
  p_lease_token uuid,
  p_channel_results jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  job_row inquiry_private."NotificationJob"%rowtype;
  result_item jsonb;
  result_channel text;
  result_status text;
  has_retryable_failure boolean;
  has_uncertain boolean;
  has_deferred boolean;
  has_failure boolean;
  retry_seconds integer;
  next_status text;
  next_attempt_at timestamptz;
  last_error text;
begin
  perform inquiry_private.require_notification_service_role();
  if jsonb_typeof(p_channel_results) <> 'array' or jsonb_array_length(p_channel_results) > 10 then
    raise exception 'Invalid notification channel results' using errcode = '22023';
  end if;

  select * into job_row
  from inquiry_private."NotificationJob"
  where id = p_job_id
  for update;

  if job_row.id is null then
    raise exception 'Notification job not found' using errcode = 'P0002';
  end if;
  if job_row.status <> 'processing'
    or job_row."leaseToken" is distinct from p_lease_token
    or job_row."leaseExpiresAt" <= now() then
    raise exception 'Notification job lease is stale' using errcode = '42501';
  end if;

  for result_item in select value from jsonb_array_elements(p_channel_results)
  loop
    result_channel := result_item->>'channel';
    result_status := result_item->>'status';
    if result_channel not in ('customer_email', 'staff_email', 'feishu')
      or result_status not in ('accepted', 'deferred', 'failed', 'uncertain', 'skipped') then
      raise exception 'Invalid notification channel result' using errcode = '22023';
    end if;

    insert into inquiry_private."NotificationDelivery" (
      "jobId", channel, status, attempts, retryable, "providerId", "errorCode", "acceptedAt", "updatedAt"
    )
    values (
      p_job_id,
      result_channel,
      result_status,
      1,
      coalesce((result_item->>'retryable')::boolean, false),
      nullif(left(coalesce(result_item->>'providerId', ''), 240), ''),
      nullif(left(coalesce(result_item->>'code', ''), 120), ''),
      case when result_status = 'accepted' then now() else null end,
      now()
    )
    on conflict ("jobId", channel) do update
    set status = excluded.status,
      attempts = inquiry_private."NotificationDelivery".attempts + 1,
      retryable = excluded.retryable,
      "providerId" = coalesce(excluded."providerId", inquiry_private."NotificationDelivery"."providerId"),
      "errorCode" = excluded."errorCode",
      "acceptedAt" = coalesce(inquiry_private."NotificationDelivery"."acceptedAt", excluded."acceptedAt"),
      "updatedAt" = now()
    where inquiry_private."NotificationDelivery".status not in ('accepted', 'skipped', 'uncertain');
  end loop;

  select
    coalesce(bool_or(status = 'failed' and retryable), false),
    coalesce(bool_or(status = 'uncertain'), false),
    coalesce(bool_or(status = 'deferred'), false),
    coalesce(bool_or(status = 'failed' and not retryable), false)
  into has_retryable_failure, has_uncertain, has_deferred, has_failure
  from inquiry_private."NotificationDelivery"
  where "jobId" = p_job_id;

  retry_seconds := least(3600, (30 * power(2, least(job_row.attempts, 6)))::integer);
  next_status := case
    when has_retryable_failure and job_row.attempts < 6 then 'pending'
    when has_uncertain or has_failure or has_retryable_failure then 'failed'
    when has_deferred then 'deferred'
    else 'sent'
  end;
  next_attempt_at := case when next_status = 'pending' then now() + make_interval(secs => retry_seconds) else now() end;
  last_error := case
    when has_retryable_failure then 'retryable_channel_failure'
    when has_uncertain then 'uncertain_channel_outcome'
    when has_failure then 'channel_failure'
    when has_deferred then 'provider_not_configured'
    else null
  end;

  update inquiry_private."NotificationJob"
  set status = next_status,
    "leaseToken" = null,
    "leasedBy" = null,
    "leaseExpiresAt" = null,
    "nextAttemptAt" = next_attempt_at,
    "lastError" = last_error,
    "finishedAt" = case when next_status in ('sent', 'failed', 'deferred') then now() else null end
  where id = p_job_id;
end;
$$;
revoke all on function inquiry_private.notification_finish_job(uuid, uuid, jsonb) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.notification_finish_job(uuid, uuid, jsonb) to service_role;

create or replace function public.notification_claim_jobs(
  claim_limit integer default 10,
  worker_id text default 'notification-worker',
  lease_seconds integer default 300
)
returns table(job jsonb)
language sql
security invoker
set search_path = ''
as $$
  select claimed.job
  from inquiry_private.notification_claim_jobs(claim_limit, worker_id, lease_seconds) as claimed(job);
$$;
revoke all on function public.notification_claim_jobs(integer, text, integer) from public, anon, authenticated, service_role;
grant execute on function public.notification_claim_jobs(integer, text, integer) to service_role;

create or replace function public.notification_finish_job(
  job_id uuid,
  lease_token uuid,
  channel_results jsonb
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.notification_finish_job(job_id, lease_token, channel_results);
$$;
revoke all on function public.notification_finish_job(uuid, uuid, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.notification_finish_job(uuid, uuid, jsonb) to service_role;
