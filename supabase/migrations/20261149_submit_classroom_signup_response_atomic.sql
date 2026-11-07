-- Phase 2 of docs/parent-portal-audit.md (finding H2): classroom signup submit trusted the client.
--
-- The parent route passed studentId, slot ids and role ids straight to an upsert and never checked
-- capacity, so a crafted request (or two parents submitting at once) could overfill a slot, pick a
-- slot that does not exist, or attach another family's student to a response.
--
-- This function does all checks and the write in one transaction while holding a row lock on the
-- signup (same idea as the co-op supply list RPCs in 20260916), so concurrent submissions queue up:
--   * the signup exists in the organization and is open
--   * the student belongs to the family (and the organization)
--   * every selected slot / role id exists in the signup config
--   * single-select signups accept at most one slot
--   * slot capacity, role quantityNeeded and open-signup maxFamilies are not exceeded
--     (the submitting family's own previous response never counts against itself)
--
-- Errors are raised as 'classroom_signup:<reason>' so the API route can map them to 4xx responses:
--   not_found, invalid_student, invalid_selection, slot_full, role_full, signup_full
--
-- Service role only: the parent route calls it with the admin client after verifying the user.
-- Run after: 20261148_restrict_family_financial_reads_to_staff.sql

create or replace function public.submit_classroom_signup_response_atomic(
  p_organization_id uuid,
  p_signup_id uuid,
  p_family_id uuid,
  p_student_id uuid,
  p_selected_slot_ids jsonb,
  p_selected_role_ids jsonb,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_signup public.classroom_signups%rowtype;
  v_slots jsonb := coalesce(p_selected_slot_ids, '[]'::jsonb);
  v_roles jsonb := coalesce(p_selected_role_ids, '[]'::jsonb);
  v_slot_ids text[];
  v_role_ids text[];
  v_id text;
  v_elem jsonb;
  v_capacity integer;
  v_filled integer;
  v_max_families integer;
  v_response_id uuid;
begin
  -- Lock the signup so concurrent submissions for it are serialized.
  select *
  into v_signup
  from public.classroom_signups
  where id = p_signup_id
    and organization_id = p_organization_id
    and status = 'open'
  for update;

  if not found then
    raise exception 'classroom_signup:not_found';
  end if;

  if not exists (
    select 1
    from public.students s
    where s.id = p_student_id
      and s.family_id = p_family_id
      and s.organization_id = p_organization_id
  ) then
    raise exception 'classroom_signup:invalid_student';
  end if;

  if jsonb_typeof(v_slots) <> 'array'
    or jsonb_typeof(v_roles) <> 'array'
    or jsonb_array_length(v_slots) > 100
    or jsonb_array_length(v_roles) > 100
  then
    raise exception 'classroom_signup:invalid_selection';
  end if;

  -- De-duplicate while keeping the client's order.
  select coalesce(array_agg(t.value order by t.ord), '{}'::text[])
  into v_slot_ids
  from (
    select distinct on (e.value) e.value, e.ord
    from jsonb_array_elements_text(v_slots) with ordinality as e(value, ord)
    order by e.value, e.ord
  ) t;

  select coalesce(array_agg(t.value order by t.ord), '{}'::text[])
  into v_role_ids
  from (
    select distinct on (e.value) e.value, e.ord
    from jsonb_array_elements_text(v_roles) with ordinality as e(value, ord)
    order by e.value, e.ord
  ) t;

  if cardinality(v_slot_ids) > 1
    and coalesce((v_signup.config ->> 'allowMultipleSelections') = 'true', false) = false
  then
    raise exception 'classroom_signup:invalid_selection';
  end if;

  -- Slots: must exist in config and have room (excluding this family's own response).
  foreach v_id in array v_slot_ids loop
    select elem
    into v_elem
    from jsonb_array_elements(coalesce(v_signup.config -> 'slots', '[]'::jsonb)) as elem
    where elem ->> 'id' = v_id
    limit 1;

    if not found then
      raise exception 'classroom_signup:invalid_selection';
    end if;

    if (v_elem ->> 'capacity') ~ '^\d+$' then
      v_capacity := (v_elem ->> 'capacity')::integer;

      select count(*)
      into v_filled
      from public.classroom_signup_responses r
      where r.signup_id = p_signup_id
        and r.status = 'confirmed'
        and r.family_id <> p_family_id
        and jsonb_exists(r.selected_slot_ids, v_id);

      if v_filled >= v_capacity then
        raise exception 'classroom_signup:slot_full';
      end if;
    end if;
  end loop;

  -- Roles: must exist in config and still need people.
  foreach v_id in array v_role_ids loop
    select elem
    into v_elem
    from jsonb_array_elements(coalesce(v_signup.config -> 'roles', '[]'::jsonb)) as elem
    where elem ->> 'id' = v_id
    limit 1;

    if not found then
      raise exception 'classroom_signup:invalid_selection';
    end if;

    if (v_elem ->> 'quantityNeeded') ~ '^\d+$' then
      v_capacity := (v_elem ->> 'quantityNeeded')::integer;

      select count(*)
      into v_filled
      from public.classroom_signup_responses r
      where r.signup_id = p_signup_id
        and r.status = 'confirmed'
        and r.family_id <> p_family_id
        and jsonb_exists(r.selected_role_ids, v_id);

      if v_filled >= v_capacity then
        raise exception 'classroom_signup:role_full';
      end if;
    end if;
  end loop;

  -- Open signups may cap the number of families.
  if v_signup.signup_type = 'open'
    and (v_signup.config ->> 'maxFamilies') ~ '^\d+$'
  then
    v_max_families := (v_signup.config ->> 'maxFamilies')::integer;

    select count(*)
    into v_filled
    from public.classroom_signup_responses r
    where r.signup_id = p_signup_id
      and r.status = 'confirmed'
      and r.family_id <> p_family_id;

    if v_filled >= v_max_families then
      raise exception 'classroom_signup:signup_full';
    end if;
  end if;

  insert into public.classroom_signup_responses (
    organization_id,
    signup_id,
    family_id,
    student_id,
    selected_slot_ids,
    selected_role_ids,
    note,
    status
  )
  values (
    p_organization_id,
    p_signup_id,
    p_family_id,
    p_student_id,
    to_jsonb(v_slot_ids),
    to_jsonb(v_role_ids),
    left(p_note, 2000),
    'confirmed'
  )
  on conflict (signup_id, family_id) do update
  set student_id = excluded.student_id,
      selected_slot_ids = excluded.selected_slot_ids,
      selected_role_ids = excluded.selected_role_ids,
      note = excluded.note,
      status = 'confirmed'
  returning id into v_response_id;

  return v_response_id;
end;
$$;

revoke execute on function public.submit_classroom_signup_response_atomic(uuid, uuid, uuid, uuid, jsonb, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.submit_classroom_signup_response_atomic(uuid, uuid, uuid, uuid, jsonb, jsonb, text)
  to service_role;
