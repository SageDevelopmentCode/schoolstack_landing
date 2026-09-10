-- Fix teaching-schedule append/remove RPC role fall-through.
-- Run after: 20260918_coop_signup_atomic_remove_rpcs.sql
--
-- PL/pgSQL RETURN QUERY does not exit the function; instructor branches were
-- falling through and also updating assistant arrays.

create or replace function public.append_program_coop_teaching_schedule_parent(
  p_week_id uuid,
  p_program_id uuid,
  p_organization_id uuid,
  p_role text,
  p_family_id uuid,
  p_enforce_single_slot boolean default false
)
returns setof public.program_coop_teaching_schedule_weeks
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_family_id is null or p_role not in ('instructor', 'assistant') then
    return;
  end if;

  if p_role = 'instructor' then
    return query
    update public.program_coop_teaching_schedule_weeks
    set instructor_family_ids = array_append(instructor_family_ids, p_family_id)
    where id = p_week_id
      and program_id = p_program_id
      and organization_id = p_organization_id
      and (not p_enforce_single_slot or cardinality(instructor_family_ids) = 0)
      and not (p_family_id = any (instructor_family_ids))
    returning *;
  elsif p_role = 'assistant' then
    return query
    update public.program_coop_teaching_schedule_weeks
    set assistant_family_ids = array_append(assistant_family_ids, p_family_id)
    where id = p_week_id
      and program_id = p_program_id
      and organization_id = p_organization_id
      and (not p_enforce_single_slot or cardinality(assistant_family_ids) = 0)
      and not (p_family_id = any (assistant_family_ids))
    returning *;
  end if;
end;
$$;

create or replace function public.remove_program_coop_teaching_schedule_parent(
  p_week_id uuid,
  p_program_id uuid,
  p_organization_id uuid,
  p_role text,
  p_family_id uuid
)
returns setof public.program_coop_teaching_schedule_weeks
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_family_id is null or p_role not in ('instructor', 'assistant') then
    return;
  end if;

  if p_role = 'instructor' then
    return query
    update public.program_coop_teaching_schedule_weeks
    set instructor_family_ids = array_remove(instructor_family_ids, p_family_id)
    where id = p_week_id
      and program_id = p_program_id
      and organization_id = p_organization_id
      and p_family_id = any (instructor_family_ids)
    returning *;
  elsif p_role = 'assistant' then
    return query
    update public.program_coop_teaching_schedule_weeks
    set assistant_family_ids = array_remove(assistant_family_ids, p_family_id)
    where id = p_week_id
      and program_id = p_program_id
      and organization_id = p_organization_id
      and p_family_id = any (assistant_family_ids)
    returning *;
  end if;
end;
$$;

-- Remove assistant entries that duplicate an instructor on the same week
-- (artifact of the append fall-through bug).
update public.program_coop_teaching_schedule_weeks w
set assistant_family_ids = coalesce(
  (
    select array_agg(x order by ord)
    from (
      select x, ordinality as ord
      from unnest(w.assistant_family_ids) with ordinality as t(x, ordinality)
    ) s
    where not (x = any (w.instructor_family_ids))
  ),
  '{}'::uuid[]
)
where exists (
  select 1
  from unnest(w.assistant_family_ids) x
  where x = any (w.instructor_family_ids)
);
