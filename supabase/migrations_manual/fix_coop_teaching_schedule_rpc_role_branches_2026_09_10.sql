-- Promoted to supabase/migrations/20260919_fix_coop_teaching_schedule_rpc_role_branches.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-10
-- Run after: coop_signup_atomic_remove_rpcs_2026_09_10.sql
--
-- Fixes PL/pgSQL fall-through in teaching-schedule append/remove RPCs and cleans up
-- dual-assigned assistant slots from the bug.

-- PRE-FLIGHT: count weeks with duplicate instructor+assistant family assignments
-- select count(*) as affected_weeks
-- from public.program_coop_teaching_schedule_weeks w
-- where exists (
--   select 1
--   from unnest(w.assistant_family_ids) x
--   where x = any (w.instructor_family_ids)
-- );

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

-- Remove assistant entries that duplicate an instructor on the same week.
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

-- POST-FLIGHT: should return 0 after cleanup
-- select count(*) as remaining_affected_weeks
-- from public.program_coop_teaching_schedule_weeks w
-- where exists (
--   select 1
--   from unnest(w.assistant_family_ids) x
--   where x = any (w.instructor_family_ids)
-- );

-- ---------------------------------------------------------------------------
-- VERIFICATION (dry-run): instructor signup must not mutate assistant_family_ids
-- Run once after applying; uses rollback so no data persists.
-- ---------------------------------------------------------------------------

begin;

do $$
declare
  v_week public.program_coop_teaching_schedule_weeks;
  v_family_id uuid := gen_random_uuid();
  v_assistant_count int;
  v_instructor_count int;
begin
  select *
  into v_week
  from public.program_coop_teaching_schedule_weeks
  where cardinality(instructor_family_ids) = 0
    and cardinality(assistant_family_ids) = 0
  limit 1;

  if v_week.id is null then
    raise notice 'SKIP verification: no empty teaching week found';
    return;
  end if;

  perform *
  from public.append_program_coop_teaching_schedule_parent(
    v_week.id,
    v_week.program_id,
    v_week.organization_id,
    'instructor',
    v_family_id,
    true
  );

  select
    cardinality(assistant_family_ids),
    cardinality(instructor_family_ids)
  into v_assistant_count, v_instructor_count
  from public.program_coop_teaching_schedule_weeks
  where id = v_week.id;

  if v_assistant_count <> 0 then
    raise exception
      'append_program_coop_teaching_schedule_parent(instructor) mutated assistant_family_ids (count=%)',
      v_assistant_count;
  end if;

  if v_instructor_count <> 1 then
    raise exception
      'append_program_coop_teaching_schedule_parent(instructor) expected 1 instructor (count=%)',
      v_instructor_count;
  end if;

  raise notice 'OK: instructor signup left assistant_family_ids empty';
end $$;

rollback;
