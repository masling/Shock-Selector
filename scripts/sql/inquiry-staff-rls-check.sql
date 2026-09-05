-- Run only against the dedicated Supabase development project after applying
-- 20260905041109_inquiry_staff_workbench.sql. All fixtures roll back.
begin;

do $$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  staff_operator uuid := gen_random_uuid();
  staff_manager uuid := gen_random_uuid();
  nonstaff uuid := gen_random_uuid();
  inquiry_id uuid;
  other_inquiry_id uuid;
  staff_message_id uuid;
  note_count integer;
  message_count integer;
  job_count integer;
  quote_count integer;
  status_job_count integer;
  denied boolean;
begin
  insert into auth.users (id, email, email_confirmed_at, is_anonymous, aud, role)
  values
    (user_a, 'staff-rls-a@example.invalid', now(), false, 'authenticated', 'authenticated'),
    (user_b, 'staff-rls-b@example.invalid', now(), false, 'authenticated', 'authenticated'),
    (staff_operator, 'staff-operator@example.invalid', now(), false, 'authenticated', 'authenticated'),
    (staff_manager, 'staff-manager@example.invalid', now(), false, 'authenticated', 'authenticated'),
    (nonstaff, 'staff-nonstaff@example.invalid', now(), false, 'authenticated', 'authenticated');

  insert into inquiry_private."StaffMember" ("userId", role, "displayName")
  values
    (staff_operator, 'operator', 'RLS Operator'),
    (staff_manager, 'manager', 'RLS Manager');

  perform set_config('request.jwt.claims', jsonb_build_object('sub', user_a, 'email', 'staff-rls-a@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message, items)
  values (user_a, gen_random_uuid(), 'standard', 'en', 'Customer A', 'staff-rls-a@example.invalid', 'Germany', 'Customer owned inquiry',
    '[{"model":"EK-STF-A","quantity":2,"note":""}]'::jsonb)
  returning id into inquiry_id;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', user_b, 'email', 'staff-rls-b@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message)
  values (user_b, gen_random_uuid(), 'project', 'en', 'Customer B', 'staff-rls-b@example.invalid', 'France', 'Other customer inquiry')
  returning id into other_inquiry_id;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', nonstaff, 'email', 'staff-nonstaff@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  denied := false;
  begin
    perform public.staff_list_inquiries(1, null);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: nonstaff listed staff inquiries'; end if;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_operator, 'email', 'staff-operator@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_claim_inquiry(inquiry_id);
  perform public.staff_update_inquiry_status(inquiry_id, 'reviewing');
  reset role;
  select count(*) into status_job_count from inquiry_private."NotificationJob" where "inquiryId" = inquiry_id and kind = 'status_changed';
  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_operator, 'email', 'staff-operator@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_update_inquiry_status(inquiry_id, 'reviewing');
  reset role;
  select count(*) into job_count from inquiry_private."NotificationJob" where "inquiryId" = inquiry_id and kind = 'status_changed';
  if job_count <> status_job_count then raise exception 'FAIL: unchanged status retry queued notification'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_operator, 'email', 'staff-operator@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_update_inquiry_status(inquiry_id, 'awaiting_customer');
  perform public.staff_update_inquiry_status(inquiry_id, 'reviewing');
  reset role;
  select count(*) into job_count from inquiry_private."NotificationJob" where "inquiryId" = inquiry_id and kind = 'status_changed';
  if job_count <> status_job_count + 2 then raise exception 'FAIL: legitimate status re-entry did not queue a new event'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_operator, 'email', 'staff-operator@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_add_internal_note(inquiry_id, 'Private sizing caveat for staff only');
  reset role;
  select count(*) into note_count from inquiry_private."InternalNote" where "inquiryId" = inquiry_id;
  if note_count <> 1 then raise exception 'FAIL: internal note not saved'; end if;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_operator, 'email', 'staff-operator@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_add_public_reply(inquiry_id, gen_random_uuid(), 'Public reply visible to customer');
  reset role;
  select id into staff_message_id from public."InquiryMessage" where "inquiryId" = inquiry_id and "authorRole" = 'staff' limit 1;
  if staff_message_id is null then raise exception 'FAIL: staff public reply not saved'; end if;
  select count(*) into job_count from inquiry_private."NotificationJob" where "inquiryId" = inquiry_id and kind = 'staff_reply';
  if job_count <> 1 then raise exception 'FAIL: staff reply notification job missing'; end if;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_operator, 'email', 'staff-operator@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_save_quote_draft(inquiry_id, '{"currency":"EUR","lines":[{"model":"EK-STF-A","quantity":2,"unitPrice":"12.34","leadTime":"2 weeks","note":""}]}'::jsonb);
  denied := false;
  begin
    perform public.staff_approve_quote(inquiry_id);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: operator approved quote'; end if;
  denied := false;
  begin
    perform public.staff_publish_quote(inquiry_id);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: operator published quote'; end if;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_manager, 'email', 'staff-manager@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_approve_quote(inquiry_id);
  reset role;
  select count(*) into quote_count from public."PublishedInquiryQuote" where "inquiryId" = inquiry_id;
  if quote_count <> 0 then raise exception 'FAIL: approved quote visible before publish'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_manager, 'email', 'staff-manager@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.staff_publish_quote(inquiry_id);
  perform public.staff_publish_quote(inquiry_id);
  reset role;
  select count(*) into quote_count from public."PublishedInquiryQuote" where "inquiryId" = inquiry_id;
  if quote_count <> 1 then raise exception 'FAIL: publish retry created duplicate public quote'; end if;
  select count(*) into job_count from inquiry_private."NotificationJob" where "inquiryId" = inquiry_id and kind = 'quote_published';
  if job_count <> 1 then raise exception 'FAIL: quote_published notification job missing'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', staff_manager, 'email', 'staff-manager@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  denied := false;
  begin
    perform public.staff_save_quote_draft(inquiry_id, '{"currency":"EUR","lines":[{"model":"MUTATED","quantity":1,"unitPrice":"","leadTime":"","note":""}]}'::jsonb);
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: published quote was mutable'; end if;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', user_a, 'email', 'staff-rls-a@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  denied := false;
  begin
    perform 1 from inquiry_private."InternalNote" where "inquiryId" = inquiry_id;
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: customer can read internal notes'; end if;

  select count(*) into message_count from public."InquiryMessage" where id = staff_message_id;
  if message_count <> 1 then raise exception 'FAIL: customer cannot read staff public reply'; end if;
  select count(*) into quote_count from public."PublishedInquiryQuote" where "inquiryId" = inquiry_id;
  if quote_count <> 1 then raise exception 'FAIL: owning customer cannot read published quote'; end if;
  select count(*) into message_count from public."InquiryMessage" m where m."inquiryId" = other_inquiry_id;
  if message_count <> 0 then raise exception 'FAIL: customer saw another customer thread'; end if;
  reset role;

  perform set_config('request.jwt.claims', jsonb_build_object('sub', user_b, 'email', 'staff-rls-b@example.invalid', 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into quote_count from public."PublishedInquiryQuote" where "inquiryId" = inquiry_id;
  if quote_count <> 0 then raise exception 'FAIL: another customer read published quote'; end if;
  reset role;
end;
$$;

rollback;
select 'PASS: staff membership required, operator actions allowed, manager-only quote approval/publish enforced, approval hidden until publish, public quote owner-only, published quote immutable, internal notes private, staff replies/status/quote events queued, fixtures rolled back' as result;
