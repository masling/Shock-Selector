-- Run only against the dedicated Supabase development project. All fixtures
-- (including Auth identities) are rolled back; no emails or notifications send.
begin;
do $$
declare
  user_a uuid := gen_random_uuid(); user_b uuid := gen_random_uuid();
  unverified uuid := gen_random_uuid(); inquiry_id uuid; message_id uuid;
  submission_key uuid := gen_random_uuid(); rows_seen integer; denied boolean;
begin
  insert into auth.users (id, email, email_confirmed_at, is_anonymous, aud, role)
  values (user_a, 'rls-a@example.invalid', now(), false, 'authenticated', 'authenticated'),
         (user_b, 'rls-b@example.invalid', now(), false, 'authenticated', 'authenticated'),
         (unverified, 'rls-unverified@example.invalid', null, false, 'authenticated', 'authenticated');
  perform set_config('request.jwt.claims', jsonb_build_object('sub',user_a,'email','rls-a@example.invalid','role','authenticated')::text, true);
  set local role authenticated;
  insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message)
    values (user_a, submission_key, 'project', 'en', 'RLS fixture', 'rls-a@example.invalid', 'Germany', 'Test only') returning id into inquiry_id;
  select count(*) into rows_seen from public."CustomerInquiry" where id = inquiry_id;
  if rows_seen <> 1 then raise exception 'FAIL: owner cannot read inquiry'; end if;
  denied := false;
  begin
    insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message, items)
      values (user_a, gen_random_uuid(), 'standard', 'en', 'Malformed items', 'rls-a@example.invalid', 'Germany', 'Test only', '[42]'::jsonb);
  exception when check_violation then denied := true; end;
  if not denied then raise exception 'FAIL: malformed items bypassed database validation'; end if;
  insert into public."InquiryMessage" ("inquiryId", "authorId", "submissionKey", body)
    values (inquiry_id, user_a, gen_random_uuid(), 'Customer test message') returning id into message_id;

  denied := false;
  begin
    insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message)
      values (user_a, submission_key, 'project', 'en', 'RLS fixture', 'rls-a@example.invalid', 'Germany', 'Test retry');
  exception when unique_violation then denied := true; end;
  if not denied then raise exception 'FAIL: duplicate submission accepted'; end if;

  denied := false;
  begin update public."CustomerInquiry" set status = 'quoted' where id = inquiry_id;
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: customer changed server-owned status'; end if;

  denied := false;
  begin perform 1 from inquiry_private."InternalNote";
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: customer can read internal notes'; end if;
  denied := false;
  begin perform 1 from inquiry_private."NotificationJob";
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: customer can access notification jobs'; end if;

  reset role;
  perform set_config('request.jwt.claims', jsonb_build_object('sub',user_b,'email','rls-b@example.invalid','role','authenticated')::text, true);
  set local role authenticated;
  select count(*) into rows_seen from public."CustomerInquiry" where id = inquiry_id;
  if rows_seen <> 0 then raise exception 'FAIL: another customer read inquiry'; end if;
  select count(*) into rows_seen from public."InquiryMessage" where id = message_id;
  if rows_seen <> 0 then raise exception 'FAIL: another customer read message'; end if;
  denied := false;
  begin
    insert into public."InquiryMessage" ("inquiryId", "authorId", "submissionKey", body)
      values (inquiry_id, user_b, gen_random_uuid(), 'Unauthorized message');
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: another customer replied to inquiry'; end if;
  denied := false;
  begin
    insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message)
      values (user_a, gen_random_uuid(), 'project', 'en', 'Spoofed owner', 'rls-b@example.invalid', 'France', 'Test only');
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: customer spoofed owner'; end if;

  reset role;
  perform set_config('request.jwt.claims', jsonb_build_object('sub',unverified,'email','rls-unverified@example.invalid','role','authenticated')::text, true);
  set local role authenticated;
  denied := false;
  begin
    insert into public."CustomerInquiry" ("userId", "submissionKey", kind, locale, "contactName", email, country, message)
      values (unverified, gen_random_uuid(), 'project', 'en', 'Unverified', 'rls-unverified@example.invalid', 'France', 'Test only');
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: unverified customer submitted'; end if;

  reset role;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  denied := false;
  begin perform 1 from public."CustomerInquiry";
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL: anonymous access'; end if;

  reset role;
  select count(*) into rows_seen from inquiry_private."NotificationJob" where "inquiryId" = inquiry_id;
  if rows_seen <> 2 then raise exception 'FAIL: transactional outbox or duplicate handling'; end if;
end;
$$;
rollback;
select 'PASS: owner isolation, verified identity, immutable status, private notes/jobs, anonymous denial, idempotency, atomic outbox; all fixtures rolled back' as result;
