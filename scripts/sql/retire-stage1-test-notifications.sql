-- Production activation guard: the acceptance inquiry is retained, but its
-- TEST ONLY outbox events must never be delivered to customer/staff channels.
do $$
declare
  target_inquiry uuid := '79cfa6a6-3dee-4b8e-8d23-125b1f529128';
  target_reference text;
  target_message text;
  pending_count integer;
begin
  select reference, message into target_reference, target_message
  from public."CustomerInquiry" where id = target_inquiry;

  if target_reference <> 'EKD-2E23AA9C19454B7F81F408FB571675E2'
    or target_message <> 'TEST ONLY — not a real purchasing request' then
    raise exception 'Acceptance inquiry identity changed; refusing to retire notifications';
  end if;

  select count(*) into pending_count
  from inquiry_private."NotificationJob"
  where "inquiryId" = target_inquiry and status = 'pending';
  if pending_count <> 4 then
    raise exception 'Expected 4 pending acceptance notifications, found %', pending_count;
  end if;

  update inquiry_private."NotificationJob"
  set status = 'failed',
    "lastError" = 'test_event_not_sent',
    "finishedAt" = now(),
    "leaseToken" = null,
    "leasedBy" = null,
    "leaseExpiresAt" = null
  where "inquiryId" = target_inquiry and status = 'pending';
end;
$$;
