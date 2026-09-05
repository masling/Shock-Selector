-- Validate JSON at the database boundary as well as in the website API.
-- CLI-generated locally; aligned with the applied remote migration version.
create function inquiry_private.valid_inquiry_items(value jsonb) returns boolean
language plpgsql immutable security invoker set search_path = '' as $$
declare item jsonb; quantity numeric;
begin
  if jsonb_typeof(value) <> 'array' or jsonb_array_length(value) > 50 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'object' or not (item ?& array['model','quantity','note'])
      or (item - 'model' - 'quantity' - 'note') <> '{}'::jsonb
      or jsonb_typeof(item->'model') <> 'string' or char_length(btrim(item->>'model')) not between 1 and 120
      or jsonb_typeof(item->'note') <> 'string' or char_length(item->>'note') > 500
      or jsonb_typeof(item->'quantity') <> 'number' then return false; end if;
    quantity := (item->>'quantity')::numeric;
    if quantity < 1 or quantity > 1000000 or quantity <> trunc(quantity) then return false; end if;
  end loop;
  return (select count(distinct upper(e->>'model')) from jsonb_array_elements(value) e) = jsonb_array_length(value);
end;
$$;
revoke all on function inquiry_private.valid_inquiry_items(jsonb) from public, anon;
grant execute on function inquiry_private.valid_inquiry_items(jsonb) to authenticated;
alter table public."CustomerInquiry" add constraint "CustomerInquiry_items_shape_check"
  check (inquiry_private.valid_inquiry_items(items));
alter table public."CustomerInquiry" add constraint "CustomerInquiry_kind_requirements_check"
  check ((kind <> 'standard' or jsonb_array_length(items) > 0)
    and (kind <> 'replacement' or char_length(btrim("originalModel")) > 0));
