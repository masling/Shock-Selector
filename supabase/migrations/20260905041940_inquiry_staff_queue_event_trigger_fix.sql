-- Fix shared inquiry notification trigger function for tables with different row shapes.
-- CustomerInquiry rows do not have InquiryMessage-only fields such as authorRole.

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
