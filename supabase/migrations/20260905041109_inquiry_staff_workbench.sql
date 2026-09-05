-- Internal inquiry workbench foundation.
-- Additive migration only; does not rewrite earlier customer inquiry migrations.
-- Staff authorization is stored in private DB membership, never user_metadata.

create schema if not exists inquiry_private;
revoke all on schema inquiry_private from public, anon;
grant usage on schema inquiry_private to authenticated;

create table inquiry_private."StaffMember" (
  "userId" uuid primary key references auth.users(id) on delete restrict,
  role text not null check (role in ('operator', 'manager')),
  "displayName" text not null default '' check (char_length("displayName") <= 120),
  active boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index "StaffMember_active_role_idx" on inquiry_private."StaffMember" (active, role);
alter table inquiry_private."StaffMember" enable row level security;
revoke all on inquiry_private."StaffMember" from public, anon, authenticated;

create table inquiry_private."StaffAssignment" (
  "inquiryId" uuid primary key references public."CustomerInquiry"(id) on delete restrict,
  "staffUserId" uuid not null references auth.users(id) on delete restrict,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index "StaffAssignment_staffUserId_idx" on inquiry_private."StaffAssignment" ("staffUserId");
alter table inquiry_private."StaffAssignment" enable row level security;
revoke all on inquiry_private."StaffAssignment" from public, anon, authenticated;

alter table inquiry_private."InternalNote"
  add column if not exists "staffUserId" uuid references auth.users(id) on delete restrict;
create index if not exists "InternalNote_staffUserId_idx" on inquiry_private."InternalNote" ("staffUserId");

create table inquiry_private."QuoteDraft" (
  id uuid primary key default gen_random_uuid(),
  "inquiryId" uuid not null references public."CustomerInquiry"(id) on delete restrict,
  "staffUserId" uuid not null references auth.users(id) on delete restrict,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 40000),
  status text not null default 'draft' check (status in ('draft', 'approved', 'published')),
  "approvedBy" uuid references auth.users(id) on delete restrict,
  "approvedAt" timestamptz,
  "publishedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("inquiryId")
);
create index "QuoteDraft_status_idx" on inquiry_private."QuoteDraft" (status);
create index "QuoteDraft_staffUserId_idx" on inquiry_private."QuoteDraft" ("staffUserId");
alter table inquiry_private."QuoteDraft" enable row level security;
revoke all on inquiry_private."QuoteDraft" from public, anon, authenticated;

create table public."PublishedInquiryQuote" (
  id uuid primary key default gen_random_uuid(),
  "inquiryId" uuid not null unique references public."CustomerInquiry"(id) on delete restrict,
  "quoteDraftId" uuid not null unique references inquiry_private."QuoteDraft"(id) on delete restrict,
  currency text not null check (char_length(currency) between 1 and 16),
  validity text not null default '' check (char_length(validity) <= 120),
  "deliveryTerm" text not null default '' check (char_length("deliveryTerm") <= 120),
  "paymentTerm" text not null default '' check (char_length("paymentTerm") <= 120),
  notes text not null default '' check (char_length(notes) <= 2000),
  lines jsonb not null check (jsonb_typeof(lines) = 'array' and jsonb_array_length(lines) between 1 and 50 and octet_length(lines::text) <= 40000),
  "publishedBy" uuid not null references auth.users(id) on delete restrict,
  "publishedAt" timestamptz not null default now()
);
create index "PublishedInquiryQuote_inquiryId_idx" on public."PublishedInquiryQuote" ("inquiryId");
alter table public."PublishedInquiryQuote" enable row level security;
revoke all on public."PublishedInquiryQuote" from public, anon, authenticated;
grant select (id, "inquiryId", currency, validity, "deliveryTerm", "paymentTerm", notes, lines, "publishedAt")
  on public."PublishedInquiryQuote" to authenticated;
create policy published_quote_customer_read on public."PublishedInquiryQuote" for select to authenticated
  using (exists (
    select 1 from public."CustomerInquiry" i
    where i.id = "inquiryId"
      and i."userId" = (select auth.uid())
      and (select inquiry_private.verified_customer())
  ));

create table inquiry_private."StaffActivityLog" (
  id uuid primary key default gen_random_uuid(),
  "inquiryId" uuid references public."CustomerInquiry"(id) on delete restrict,
  "staffUserId" uuid not null references auth.users(id) on delete restrict,
  action text not null check (char_length(action) between 1 and 80),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 20000),
  "createdAt" timestamptz not null default now()
);
create index "StaffActivityLog_inquiryId_createdAt_idx" on inquiry_private."StaffActivityLog" ("inquiryId", "createdAt" desc);
create index "StaffActivityLog_staffUserId_createdAt_idx" on inquiry_private."StaffActivityLog" ("staffUserId", "createdAt" desc);
alter table inquiry_private."StaffActivityLog" enable row level security;
revoke all on inquiry_private."StaffActivityLog" from public, anon, authenticated;

create or replace function inquiry_private.staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select sm.role
  from inquiry_private."StaffMember" sm
  join auth.users au on au.id = sm."userId"
  where sm."userId" = (select auth.uid())
    and sm.active
    and au.email_confirmed_at is not null
    and coalesce(au.is_anonymous, false) = false
  limit 1;
$$;
revoke all on function inquiry_private.staff_role() from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_role() to authenticated;

create or replace function inquiry_private.require_staff(required_role text default 'operator')
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare staff_role_name text;
begin
  if auth.uid() is null then
    raise exception 'Staff authentication required' using errcode = '42501';
  end if;

  staff_role_name := inquiry_private.staff_role();
  if staff_role_name is null then
    raise exception 'Staff membership required' using errcode = '42501';
  end if;

  if required_role = 'manager' and staff_role_name <> 'manager' then
    raise exception 'Staff manager role required' using errcode = '42501';
  end if;

  if required_role not in ('operator', 'manager') then
    raise exception 'Invalid staff role requirement' using errcode = '22023';
  end if;

  return staff_role_name;
end;
$$;
revoke all on function inquiry_private.require_staff(text) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.require_staff(text) to authenticated;

create or replace function inquiry_private.log_staff_activity(inquiry_id uuid, action_name text, activity_payload jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform inquiry_private.require_staff('operator');
  insert into inquiry_private."StaffActivityLog" ("inquiryId", "staffUserId", action, payload)
  values (inquiry_id, (select auth.uid()), action_name, coalesce(activity_payload, '{}'::jsonb));
end;
$$;
revoke all on function inquiry_private.log_staff_activity(uuid, text, jsonb) from public, anon, authenticated, service_role;

create or replace function inquiry_private.valid_quote_payload(value jsonb)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  line jsonb;
  quantity numeric;
begin
  if value is null or jsonb_typeof(value) <> 'object' or not (value ?& array['currency', 'lines']) then return false; end if;
  if (value - 'currency' - 'validity' - 'deliveryTerm' - 'paymentTerm' - 'notes' - 'lines') <> '{}'::jsonb then return false; end if;
  if jsonb_typeof(value->'currency') <> 'string' or char_length(btrim(value->>'currency')) not between 1 and 16 then return false; end if;
  if coalesce(jsonb_typeof(value->'validity'), 'string') <> 'string' or char_length(coalesce(value->>'validity', '')) > 120 then return false; end if;
  if coalesce(jsonb_typeof(value->'deliveryTerm'), 'string') <> 'string' or char_length(coalesce(value->>'deliveryTerm', '')) > 120 then return false; end if;
  if coalesce(jsonb_typeof(value->'paymentTerm'), 'string') <> 'string' or char_length(coalesce(value->>'paymentTerm', '')) > 120 then return false; end if;
  if coalesce(jsonb_typeof(value->'notes'), 'string') <> 'string' or char_length(coalesce(value->>'notes', '')) > 2000 then return false; end if;
  if jsonb_typeof(value->'lines') <> 'array' or jsonb_array_length(value->'lines') not between 1 and 50 then return false; end if;

  for line in select * from jsonb_array_elements(value->'lines') loop
    if jsonb_typeof(line) <> 'object' or not (line ?& array['model', 'quantity'])
      or (line - 'model' - 'quantity' - 'unitPrice' - 'leadTime' - 'note') <> '{}'::jsonb
      or jsonb_typeof(line->'model') <> 'string' or char_length(btrim(line->>'model')) not between 1 and 120
      or jsonb_typeof(line->'quantity') <> 'number'
      or coalesce(jsonb_typeof(line->'unitPrice'), 'string') <> 'string' or char_length(coalesce(line->>'unitPrice', '')) > 80
      or coalesce(jsonb_typeof(line->'leadTime'), 'string') <> 'string' or char_length(coalesce(line->>'leadTime', '')) > 120
      or coalesce(jsonb_typeof(line->'note'), 'string') <> 'string' or char_length(coalesce(line->>'note', '')) > 500 then
      return false;
    end if;
    quantity := (line->>'quantity')::numeric;
    if quantity < 1 or quantity > 1000000 or quantity <> trunc(quantity) then return false; end if;
  end loop;

  return true;
end;
$$;
revoke all on function inquiry_private.valid_quote_payload(jsonb) from public, anon;
grant execute on function inquiry_private.valid_quote_payload(jsonb) to authenticated;

alter table inquiry_private."QuoteDraft"
  add constraint "QuoteDraft_payload_shape_check" check (inquiry_private.valid_quote_payload(payload));
alter table public."PublishedInquiryQuote"
  add constraint "PublishedInquiryQuote_lines_shape_check" check (inquiry_private.valid_quote_payload(jsonb_build_object(
    'currency', currency,
    'validity', validity,
    'deliveryTerm', "deliveryTerm",
    'paymentTerm', "paymentTerm",
    'notes', notes,
    'lines', lines
  )));

create or replace function inquiry_private.staff_list_inquiries(p_page integer default 1, p_status text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  staff_role_name text;
  safe_page integer;
  safe_status text;
  offset_rows integer;
  total_count integer;
  items jsonb;
begin
  staff_role_name := inquiry_private.require_staff('operator');
  safe_page := greatest(1, least(coalesce(p_page, 1), 10000));
  safe_status := nullif(p_status, '');
  if safe_status is not null and safe_status not in ('received', 'reviewing', 'awaiting_customer', 'quoted', 'closed') then
    raise exception 'Invalid inquiry status' using errcode = '22023';
  end if;
  offset_rows := (safe_page - 1) * 20;

  select count(*) into total_count
  from public."CustomerInquiry" i
  where safe_status is null or i.status = safe_status;

  select coalesce(jsonb_agg(row_payload order by sort_created desc), '[]'::jsonb) into items
  from (
    select
      i."createdAt" as sort_created,
      jsonb_build_object(
        'id', i.id,
        'reference', i.reference,
        'kind', i.kind,
        'status', i.status,
        'locale', i.locale,
        'contactName', i."contactName",
        'email', i.email,
        'company', i.company,
        'country', i.country,
        'requestedDelivery', i."requestedDelivery",
        'originalModel', i."originalModel",
        'items', i.items,
        'createdAt', i."createdAt",
        'updatedAt', i."updatedAt",
        'assignedTo', a."staffUserId",
        'staffRole', staff_role_name
      ) as row_payload
    from public."CustomerInquiry" i
    left join inquiry_private."StaffAssignment" a on a."inquiryId" = i.id
    where safe_status is null or i.status = safe_status
    order by i."createdAt" desc
    limit 20 offset offset_rows
  ) page_rows;

  return jsonb_build_object('items', items, 'total', total_count, 'page', safe_page, 'staffRole', staff_role_name);
end;
$$;
revoke all on function inquiry_private.staff_list_inquiries(integer, text) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_list_inquiries(integer, text) to authenticated;

create or replace function inquiry_private.staff_detail(inquiry_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  staff_role_name text;
  payload jsonb;
begin
  staff_role_name := inquiry_private.require_staff('operator');

  select jsonb_build_object(
    'inquiry', jsonb_build_object(
      'id', i.id,
      'reference', i.reference,
      'kind', i.kind,
      'status', i.status,
      'locale', i.locale,
      'contactName', i."contactName",
      'email', i.email,
      'company', i.company,
      'country', i.country,
      'requestedDelivery', i."requestedDelivery",
      'message', i.message,
      'originalModel', i."originalModel",
      'items', i.items,
      'createdAt', i."createdAt",
      'updatedAt', i."updatedAt"
    ),
    'assignment', case when a."inquiryId" is null then null else jsonb_build_object(
      'staffUserId', a."staffUserId",
      'createdAt', a."createdAt",
      'updatedAt', a."updatedAt"
    ) end,
    'messages', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id,
        'inquiryId', m."inquiryId",
        'authorRole', m."authorRole",
        'body', m.body,
        'createdAt', m."createdAt"
      ) order by m."createdAt")
      from (
        select * from public."InquiryMessage"
        where "inquiryId" = i.id
        order by "createdAt" desc
        limit 100
      ) m
    ), '[]'::jsonb),
    'internalNotes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', n.id,
        'inquiryId', n."inquiryId",
        'staffUserId', n."staffUserId",
        'body', n.body,
        'createdAt', n."createdAt"
      ) order by n."createdAt")
      from (
        select * from inquiry_private."InternalNote"
        where "inquiryId" = i.id
        order by "createdAt" desc
        limit 100
      ) n
    ), '[]'::jsonb),
    'quoteDraft', (
      select jsonb_build_object(
        'id', q.id,
        'inquiryId', q."inquiryId",
        'staffUserId', q."staffUserId",
        'payload', q.payload,
        'status', q.status,
        'approvedBy', q."approvedBy",
        'approvedAt', q."approvedAt",
        'publishedAt', q."publishedAt",
        'createdAt', q."createdAt",
        'updatedAt', q."updatedAt"
      )
      from inquiry_private."QuoteDraft" q
      where q."inquiryId" = i.id
    ),
    'publishedQuote', (
      select jsonb_build_object(
        'id', pq.id,
        'inquiryId', pq."inquiryId",
        'currency', pq.currency,
        'validity', pq.validity,
        'deliveryTerm', pq."deliveryTerm",
        'paymentTerm', pq."paymentTerm",
        'notes', pq.notes,
        'lines', pq.lines,
        'publishedAt', pq."publishedAt"
      )
      from public."PublishedInquiryQuote" pq
      where pq."inquiryId" = i.id
    ),
    'staffRole', staff_role_name
  ) into payload
  from public."CustomerInquiry" i
  left join inquiry_private."StaffAssignment" a on a."inquiryId" = i.id
  where i.id = inquiry_id;

  if payload is null then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;

  return payload;
end;
$$;
revoke all on function inquiry_private.staff_detail(uuid) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_detail(uuid) to authenticated;

create or replace function inquiry_private.staff_claim(inquiry_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare assignment jsonb;
begin
  perform inquiry_private.require_staff('operator');
  if not exists (select 1 from public."CustomerInquiry" where id = inquiry_id) then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;

  insert into inquiry_private."StaffAssignment" ("inquiryId", "staffUserId")
  values (inquiry_id, (select auth.uid()))
  on conflict ("inquiryId") do update
    set "staffUserId" = excluded."staffUserId", "updatedAt" = now()
  returning jsonb_build_object('inquiryId', "inquiryId", 'staffUserId', "staffUserId", 'updatedAt', "updatedAt") into assignment;

  perform inquiry_private.log_staff_activity(inquiry_id, 'claim', '{}'::jsonb);
  return assignment;
end;
$$;
revoke all on function inquiry_private.staff_claim(uuid) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_claim(uuid) to authenticated;

create or replace function inquiry_private.staff_update_status(inquiry_id uuid, next_status text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry_payload jsonb;
  previous_status text;
begin
  perform inquiry_private.require_staff('operator');
  if next_status not in ('received', 'reviewing', 'awaiting_customer', 'quoted', 'closed') then
    raise exception 'Invalid inquiry status' using errcode = '22023';
  end if;

  select status into previous_status from public."CustomerInquiry" where id = inquiry_id for update;
  if previous_status is null then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;

  if previous_status = next_status then
    select jsonb_build_object('id', id, 'reference', reference, 'status', status, 'updatedAt', "updatedAt") into inquiry_payload
    from public."CustomerInquiry" where id = inquiry_id;
    return inquiry_payload;
  end if;

  update public."CustomerInquiry"
    set status = next_status, "updatedAt" = now()
    where id = inquiry_id
    returning jsonb_build_object('id', id, 'reference', reference, 'status', status, 'updatedAt', "updatedAt") into inquiry_payload;

  insert into inquiry_private."NotificationJob" ("inquiryId", "eventKey", kind)
  values (inquiry_id, 'CustomerInquiry:status:' || inquiry_id::text || ':' || gen_random_uuid()::text, 'status_changed');
  perform inquiry_private.log_staff_activity(inquiry_id, 'status_update', jsonb_build_object('from', previous_status, 'to', next_status));
  return inquiry_payload;
end;
$$;
revoke all on function inquiry_private.staff_update_status(uuid, text) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_update_status(uuid, text) to authenticated;

create or replace function inquiry_private.staff_public_reply(inquiry_id uuid, submission_key uuid, reply_body text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare message_payload jsonb;
begin
  perform inquiry_private.require_staff('operator');
  if char_length(btrim(reply_body)) not between 1 and 10000 then
    raise exception 'Invalid reply body' using errcode = '22023';
  end if;
  if not exists (select 1 from public."CustomerInquiry" where id = inquiry_id and status <> 'closed') then
    raise exception 'Inquiry not found or closed' using errcode = 'P0002';
  end if;

  select jsonb_build_object(
    'id', id,
    'inquiryId', "inquiryId",
    'authorRole', "authorRole",
    'body', body,
    'createdAt', "createdAt"
  ) into message_payload
  from public."InquiryMessage"
  where "authorId" = (select auth.uid()) and "submissionKey" = submission_key;

  if message_payload is not null then
    if message_payload->>'inquiryId' <> inquiry_id::text or message_payload->>'body' <> btrim(reply_body) then
      raise exception 'Idempotency key conflict' using errcode = '23505';
    end if;
    return message_payload;
  end if;

  insert into public."InquiryMessage" ("inquiryId", "authorId", "submissionKey", "authorRole", body)
  values (inquiry_id, (select auth.uid()), submission_key, 'staff', btrim(reply_body))
  returning jsonb_build_object(
    'id', id,
    'inquiryId', "inquiryId",
    'authorRole', "authorRole",
    'body', body,
    'createdAt', "createdAt"
  ) into message_payload;

  update public."CustomerInquiry" set "updatedAt" = now() where id = inquiry_id;
  perform inquiry_private.log_staff_activity(inquiry_id, 'public_reply', jsonb_build_object('messageId', message_payload->>'id'));
  return message_payload;
end;
$$;
revoke all on function inquiry_private.staff_public_reply(uuid, uuid, text) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_public_reply(uuid, uuid, text) to authenticated;

create or replace function inquiry_private.staff_internal_note(inquiry_id uuid, note_body text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare note_payload jsonb;
begin
  perform inquiry_private.require_staff('operator');
  if char_length(btrim(note_body)) not between 1 and 10000 then
    raise exception 'Invalid note body' using errcode = '22023';
  end if;
  if not exists (select 1 from public."CustomerInquiry" where id = inquiry_id) then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;

  insert into inquiry_private."InternalNote" ("inquiryId", "staffUserId", body)
  values (inquiry_id, (select auth.uid()), btrim(note_body))
  returning jsonb_build_object('id', id, 'inquiryId', "inquiryId", 'staffUserId', "staffUserId", 'body', body, 'createdAt', "createdAt") into note_payload;

  perform inquiry_private.log_staff_activity(inquiry_id, 'internal_note', jsonb_build_object('noteId', note_payload->>'id'));
  return note_payload;
end;
$$;
revoke all on function inquiry_private.staff_internal_note(uuid, text) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_internal_note(uuid, text) to authenticated;

create or replace function inquiry_private.staff_save_quote(inquiry_id uuid, quote_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare saved_quote jsonb;
begin
  perform inquiry_private.require_staff('operator');
  if not inquiry_private.valid_quote_payload(quote_payload) then
    raise exception 'Invalid quote payload' using errcode = '22023';
  end if;
  perform 1 from public."CustomerInquiry" where id = inquiry_id for update;
  if not found then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;
  if exists (select 1 from inquiry_private."QuoteDraft" where "inquiryId" = inquiry_id and status = 'published')
    or exists (select 1 from public."PublishedInquiryQuote" where "inquiryId" = inquiry_id) then
    raise exception 'Published quote cannot be changed' using errcode = '42501';
  end if;

  insert into inquiry_private."QuoteDraft" ("inquiryId", "staffUserId", payload)
  values (inquiry_id, (select auth.uid()), quote_payload)
  on conflict ("inquiryId") do update
    set payload = excluded.payload,
        "staffUserId" = excluded."staffUserId",
        status = 'draft',
        "approvedBy" = null,
        "approvedAt" = null,
        "updatedAt" = now()
  returning jsonb_build_object(
    'id', id, 'inquiryId', "inquiryId", 'staffUserId', "staffUserId", 'payload', payload, 'status', status,
    'approvedBy', "approvedBy", 'approvedAt', "approvedAt", 'publishedAt', "publishedAt", 'updatedAt', "updatedAt"
  ) into saved_quote;

  perform inquiry_private.log_staff_activity(inquiry_id, 'quote_draft_save', jsonb_build_object('quoteId', saved_quote->>'id'));
  return saved_quote;
end;
$$;
revoke all on function inquiry_private.staff_save_quote(uuid, jsonb) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_save_quote(uuid, jsonb) to authenticated;

create or replace function inquiry_private.staff_approve_quote(inquiry_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare approved_quote jsonb;
begin
  perform inquiry_private.require_staff('manager');
  perform 1 from public."CustomerInquiry" where id = inquiry_id for update;
  if not found then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;

  update inquiry_private."QuoteDraft"
    set status = 'approved', "approvedBy" = (select auth.uid()), "approvedAt" = now(), "updatedAt" = now()
    where "inquiryId" = inquiry_id and status in ('draft', 'approved')
    returning jsonb_build_object('id', id, 'inquiryId', "inquiryId", 'status', status, 'approvedBy', "approvedBy", 'approvedAt', "approvedAt", 'updatedAt', "updatedAt") into approved_quote;
  if approved_quote is null then
    raise exception 'Quote draft not found' using errcode = 'P0002';
  end if;

  perform inquiry_private.log_staff_activity(inquiry_id, 'quote_approve', jsonb_build_object('quoteId', approved_quote->>'id'));
  return approved_quote;
end;
$$;
revoke all on function inquiry_private.staff_approve_quote(uuid) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_approve_quote(uuid) to authenticated;

create or replace function inquiry_private.staff_publish_quote(inquiry_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  published_quote jsonb;
  quote_record record;
begin
  perform inquiry_private.require_staff('manager');
  perform 1 from public."CustomerInquiry" where id = inquiry_id for update;
  if not found then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;

  select jsonb_build_object(
    'id', id,
    'inquiryId', "inquiryId",
    'currency', currency,
    'validity', validity,
    'deliveryTerm', "deliveryTerm",
    'paymentTerm', "paymentTerm",
    'notes', notes,
    'lines', lines,
    'publishedAt', "publishedAt"
  ) into published_quote
  from public."PublishedInquiryQuote"
  where "inquiryId" = inquiry_id;
  if published_quote is not null then
    return published_quote;
  end if;

  select * into quote_record
  from inquiry_private."QuoteDraft"
  where "inquiryId" = inquiry_id and status = 'approved'
  for update;
  if not found then
    raise exception 'Approved quote not found' using errcode = 'P0002';
  end if;
  if not inquiry_private.valid_quote_payload(quote_record.payload) then
    raise exception 'Invalid quote payload' using errcode = '22023';
  end if;

  update inquiry_private."QuoteDraft"
    set status = 'published', "publishedAt" = coalesce("publishedAt", now()), "updatedAt" = now()
    where id = quote_record.id;

  insert into public."PublishedInquiryQuote" (
    "inquiryId", "quoteDraftId", currency, validity, "deliveryTerm", "paymentTerm", notes, lines, "publishedBy"
  )
  values (
    inquiry_id,
    quote_record.id,
    btrim(quote_record.payload->>'currency'),
    coalesce(quote_record.payload->>'validity', ''),
    coalesce(quote_record.payload->>'deliveryTerm', ''),
    coalesce(quote_record.payload->>'paymentTerm', ''),
    coalesce(quote_record.payload->>'notes', ''),
    quote_record.payload->'lines',
    (select auth.uid())
  )
  on conflict ("inquiryId") do nothing
  returning jsonb_build_object(
    'id', id,
    'inquiryId', "inquiryId",
    'currency', currency,
    'validity', validity,
    'deliveryTerm', "deliveryTerm",
    'paymentTerm', "paymentTerm",
    'notes', notes,
    'lines', lines,
    'publishedAt', "publishedAt"
  ) into published_quote;

  if published_quote is null then
    select jsonb_build_object(
      'id', id,
      'inquiryId', "inquiryId",
      'currency', currency,
      'validity', validity,
      'deliveryTerm', "deliveryTerm",
      'paymentTerm', "paymentTerm",
      'notes', notes,
      'lines', lines,
      'publishedAt', "publishedAt"
    ) into published_quote
    from public."PublishedInquiryQuote"
    where "inquiryId" = inquiry_id;
  end if;

  update public."CustomerInquiry" set status = 'quoted', "updatedAt" = now() where id = inquiry_id;
  insert into inquiry_private."NotificationJob" ("inquiryId", "eventKey", kind)
  values (inquiry_id, 'QuoteDraft:published:' || inquiry_id::text, 'quote_published')
  on conflict ("eventKey") do nothing;
  perform inquiry_private.log_staff_activity(inquiry_id, 'quote_publish', jsonb_build_object('quoteId', published_quote->>'id'));
  return published_quote;
end;
$$;
revoke all on function inquiry_private.staff_publish_quote(uuid) from public, anon, authenticated, service_role;
grant execute on function inquiry_private.staff_publish_quote(uuid) to authenticated;

create or replace function inquiry_private.queue_customer_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  inquiry_id uuid;
  event_kind text;
  event_key text;
  message_author_id uuid;
  message_author_role text;
begin
  if tg_table_name = 'InquiryMessage' then
    message_author_id := (to_jsonb(new)->>'authorId')::uuid;
    message_author_role := to_jsonb(new)->>'authorRole';
    inquiry_id := (to_jsonb(new)->>'inquiryId')::uuid;
  end if;

  if tg_table_name = 'CustomerInquiry' then
    owner_id := new."userId";
    inquiry_id := new.id;
    event_kind := 'inquiry_received';
    event_key := tg_table_name || ':' || new.id::text;
    if auth.uid() is null or auth.uid() <> owner_id or not inquiry_private.verified_customer() then
      raise exception 'Verified customer required' using errcode = '42501';
    end if;
  elsif tg_table_name = 'InquiryMessage' and message_author_role = 'staff' then
    owner_id := message_author_id;
    event_kind := 'staff_reply';
    event_key := tg_table_name || ':staff:' || new.id::text;
    perform inquiry_private.require_staff('operator');
    if auth.uid() is null or auth.uid() <> owner_id then
      raise exception 'Staff author mismatch' using errcode = '42501';
    end if;
  elsif tg_table_name = 'InquiryMessage' then
    owner_id := message_author_id;
    event_kind := 'customer_message';
    event_key := tg_table_name || ':' || new.id::text;
    if auth.uid() is null or auth.uid() <> owner_id or not inquiry_private.verified_customer() then
      raise exception 'Verified customer required' using errcode = '42501';
    end if;
  else
    raise exception 'Unsupported notification trigger table' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  if tg_table_name = 'CustomerInquiry' and
    (select count(*) from public."CustomerInquiry" where "userId" = owner_id and "createdAt" > now() - interval '1 hour') > 20 then
    raise exception 'Submission limit reached' using errcode = 'P0001';
  elsif tg_table_name = 'InquiryMessage' and message_author_role = 'customer' and
    (select count(*) from public."InquiryMessage" where "authorId" = owner_id and "createdAt" > now() - interval '1 hour') > 60 then
    raise exception 'Message limit reached' using errcode = 'P0001';
  end if;

  insert into inquiry_private."NotificationJob" ("inquiryId", "eventKey", kind)
    values (inquiry_id, event_key, event_kind)
  on conflict ("eventKey") do nothing;
  return new;
end;
$$;
revoke all on function inquiry_private.queue_customer_event() from public, anon, authenticated, service_role;

create or replace function public.staff_current_member()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object('role', inquiry_private.require_staff('operator'), 'userId', (select auth.uid()));
$$;

create or replace function public.staff_list_inquiries(p_page integer default 1, p_status text default null)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_list_inquiries(p_page, p_status);
$$;

create or replace function public.staff_inquiry_detail(inquiry_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_detail(inquiry_id);
$$;

create or replace function public.staff_claim_inquiry(inquiry_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_claim(inquiry_id);
$$;

create or replace function public.staff_update_inquiry_status(inquiry_id uuid, next_status text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_update_status(inquiry_id, next_status);
$$;

create or replace function public.staff_add_public_reply(inquiry_id uuid, submission_key uuid, body text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_public_reply(inquiry_id, submission_key, body);
$$;

create or replace function public.staff_add_internal_note(inquiry_id uuid, body text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_internal_note(inquiry_id, body);
$$;

create or replace function public.staff_save_quote_draft(inquiry_id uuid, quote_payload jsonb)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_save_quote(inquiry_id, quote_payload);
$$;

create or replace function public.staff_approve_quote(inquiry_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_approve_quote(inquiry_id);
$$;

create or replace function public.staff_publish_quote(inquiry_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select inquiry_private.staff_publish_quote(inquiry_id);
$$;

revoke all on function public.staff_current_member() from public, anon;
revoke all on function public.staff_list_inquiries(integer, text) from public, anon;
revoke all on function public.staff_inquiry_detail(uuid) from public, anon;
revoke all on function public.staff_claim_inquiry(uuid) from public, anon;
revoke all on function public.staff_update_inquiry_status(uuid, text) from public, anon;
revoke all on function public.staff_add_public_reply(uuid, uuid, text) from public, anon;
revoke all on function public.staff_add_internal_note(uuid, text) from public, anon;
revoke all on function public.staff_save_quote_draft(uuid, jsonb) from public, anon;
revoke all on function public.staff_approve_quote(uuid) from public, anon;
revoke all on function public.staff_publish_quote(uuid) from public, anon;

grant execute on function public.staff_current_member() to authenticated;
grant execute on function public.staff_list_inquiries(integer, text) to authenticated;
grant execute on function public.staff_inquiry_detail(uuid) to authenticated;
grant execute on function public.staff_claim_inquiry(uuid) to authenticated;
grant execute on function public.staff_update_inquiry_status(uuid, text) to authenticated;
grant execute on function public.staff_add_public_reply(uuid, uuid, text) to authenticated;
grant execute on function public.staff_add_internal_note(uuid, text) to authenticated;
grant execute on function public.staff_save_quote_draft(uuid, jsonb) to authenticated;
grant execute on function public.staff_approve_quote(uuid) to authenticated;
grant execute on function public.staff_publish_quote(uuid) to authenticated;
