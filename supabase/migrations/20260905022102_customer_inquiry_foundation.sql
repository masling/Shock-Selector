-- Independent customer workflow; no changes to the public product catalog.
-- CLI-generated locally, filename aligned with the successfully applied remote migration.
create schema if not exists inquiry_private;
revoke all on schema inquiry_private from public, anon;
grant usage on schema inquiry_private to authenticated;

create function inquiry_private.verified_customer() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from auth.users where id = auth.uid()
      and email_confirmed_at is not null and coalesce(is_anonymous, false) = false
  );
$$;
revoke all on function inquiry_private.verified_customer() from public, anon;
grant execute on function inquiry_private.verified_customer() to authenticated;

create table public."CustomerInquiry" (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references auth.users(id) on delete restrict,
  "submissionKey" uuid not null,
  reference text not null unique default ('EKD-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  kind text not null check (kind in ('standard', 'replacement', 'project')),
  status text not null default 'received' check (status in ('received', 'reviewing', 'awaiting_customer', 'quoted', 'closed')),
  locale text not null check (locale in ('en', 'de', 'fr', 'zh-cn', 'it')),
  "contactName" text not null check (char_length("contactName") between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text not null default '' check (char_length(company) <= 200),
  country text not null check (char_length(country) between 1 and 80),
  "requestedDelivery" text not null default '' check (char_length("requestedDelivery") <= 120),
  message text not null check (char_length(message) between 1 and 10000),
  "originalModel" text not null default '' check (char_length("originalModel") <= 200),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 50 and octet_length(items::text) <= 40000),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("userId", "submissionKey")
);
create index "CustomerInquiry_userId_createdAt_idx" on public."CustomerInquiry" ("userId", "createdAt" desc);
alter table public."CustomerInquiry" enable row level security;
revoke all on public."CustomerInquiry" from public, anon, authenticated;
grant select on public."CustomerInquiry" to authenticated;
-- Status, reference and timestamps are server-owned, never supplied by a customer.
grant insert ("userId", "submissionKey", kind, locale, "contactName", email, company, country, "requestedDelivery", message, "originalModel", items) on public."CustomerInquiry" to authenticated;
create policy customer_inquiry_read on public."CustomerInquiry" for select to authenticated
  using ((select inquiry_private.verified_customer()) and "userId" = (select auth.uid()));
create policy customer_inquiry_create on public."CustomerInquiry" for insert to authenticated
  with check ((select inquiry_private.verified_customer()) and "userId" = (select auth.uid()) and email = (select auth.jwt()->>'email'));

create table public."InquiryMessage" (
  id uuid primary key default gen_random_uuid(),
  "inquiryId" uuid not null references public."CustomerInquiry"(id) on delete restrict,
  "authorId" uuid not null references auth.users(id) on delete restrict,
  "submissionKey" uuid not null,
  "authorRole" text not null default 'customer' check ("authorRole" in ('customer', 'staff')),
  body text not null check (char_length(body) between 1 and 10000),
  "createdAt" timestamptz not null default now(),
  unique ("authorId", "submissionKey")
);
create index "InquiryMessage_inquiryId_createdAt_idx" on public."InquiryMessage" ("inquiryId", "createdAt");
alter table public."InquiryMessage" enable row level security;
revoke all on public."InquiryMessage" from public, anon, authenticated;
grant select on public."InquiryMessage" to authenticated;
grant insert ("inquiryId", "authorId", "submissionKey", body) on public."InquiryMessage" to authenticated;
create policy customer_message_read on public."InquiryMessage" for select to authenticated
  using (exists (select 1 from public."CustomerInquiry" i where i.id = "inquiryId"));
create policy customer_message_create on public."InquiryMessage" for insert to authenticated
  with check ((select inquiry_private.verified_customer()) and "authorId" = (select auth.uid())
    and exists (select 1 from public."CustomerInquiry" i where i.id = "inquiryId" and i.status <> 'closed'));

-- Internal notes are deliberately a separate, non-exposed resource. They can
-- never appear in customer message queries, even if a UI filter is forgotten.
create table inquiry_private."InternalNote" (
  id uuid primary key default gen_random_uuid(),
  "inquiryId" uuid not null references public."CustomerInquiry"(id) on delete restrict,
  body text not null,
  "createdAt" timestamptz not null default now()
);
create index "InternalNote_inquiryId_idx" on inquiry_private."InternalNote" ("inquiryId");
alter table inquiry_private."InternalNote" enable row level security;
revoke all on inquiry_private."InternalNote" from public, anon, authenticated;

-- Transactional outbox: external delivery is subsequent work. A pending job is
-- not a sent email, and retries never create another inquiry.
create table inquiry_private."NotificationJob" (
  id uuid primary key default gen_random_uuid(),
  "inquiryId" uuid not null references public."CustomerInquiry"(id) on delete restrict,
  "eventKey" text not null unique,
  kind text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0,
  "createdAt" timestamptz not null default now()
);
create index "NotificationJob_pending_idx" on inquiry_private."NotificationJob" ("createdAt") where status = 'pending';
create index "NotificationJob_inquiryId_idx" on inquiry_private."NotificationJob" ("inquiryId");
alter table inquiry_private."NotificationJob" enable row level security;
revoke all on inquiry_private."NotificationJob" from public, anon, authenticated;

create function inquiry_private.queue_customer_event() returns trigger
language plpgsql security definer set search_path = '' as $$
declare owner_id uuid; inquiry_id uuid;
begin
  if tg_table_name = 'CustomerInquiry' then
    owner_id := new."userId"; inquiry_id := new.id;
  else
    owner_id := new."authorId"; inquiry_id := new."inquiryId";
  end if;
  if auth.uid() is null or auth.uid() <> owner_id or not inquiry_private.verified_customer() then
    raise exception 'Verified customer required' using errcode = '42501';
  end if;
  -- Enforce quotas in the database too; clients can call the Data API directly.
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  if tg_table_name = 'CustomerInquiry' and
    (select count(*) from public."CustomerInquiry" where "userId" = owner_id and "createdAt" > now() - interval '1 hour') > 20 then
    raise exception 'Submission limit reached' using errcode = 'P0001';
  elsif tg_table_name = 'InquiryMessage' and
    (select count(*) from public."InquiryMessage" where "authorId" = owner_id and "createdAt" > now() - interval '1 hour') > 60 then
    raise exception 'Message limit reached' using errcode = 'P0001';
  end if;
  insert into inquiry_private."NotificationJob" ("inquiryId", "eventKey", kind)
    values (inquiry_id, tg_table_name || ':' || new.id::text, case when tg_table_name = 'CustomerInquiry' then 'inquiry_received' else 'customer_message' end);
  return new;
end;
$$;
revoke all on function inquiry_private.queue_customer_event() from public, anon, authenticated, service_role;
create trigger customer_inquiry_notify after insert on public."CustomerInquiry"
  for each row execute function inquiry_private.queue_customer_event();
create trigger customer_message_notify after insert on public."InquiryMessage"
  for each row execute function inquiry_private.queue_customer_event();
