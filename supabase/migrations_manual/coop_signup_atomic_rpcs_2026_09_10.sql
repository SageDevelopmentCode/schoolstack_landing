-- Promoted to supabase/migrations/20260916_coop_signup_atomic_rpcs.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.program_coop_supply_items
  drop constraint if exists program_coop_supply_items_assigned_families_max;

alter table public.program_coop_supply_items
  add constraint program_coop_supply_items_assigned_families_max
  check (cardinality(assigned_families) <= 5);

create or replace function public.normalize_coop_family_name(p_name text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
$$;

create or replace function public.append_program_coop_supply_assigned_family(
  p_item_id uuid,
  p_program_id uuid,
  p_organization_id uuid,
  p_family_name text
)
returns setof public.program_coop_supply_items
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text;
begin
  v_normalized := public.normalize_coop_family_name(p_family_name);
  if v_normalized = '' then
    return;
  end if;

  return query
  update public.program_coop_supply_items
  set assigned_families = array_append(assigned_families, v_normalized)
  where id = p_item_id
    and program_id = p_program_id
    and organization_id = p_organization_id
    and cardinality(assigned_families) < 5
    and not exists (
      select 1
      from unnest(assigned_families) as existing_family(family_name)
      where lower(existing_family.family_name) = lower(v_normalized)
    )
  returning *;
end;
$$;

create or replace function public.append_program_coop_teaching_schedule_parent(
  p_week_id uuid,
  p_program_id uuid,
  p_organization_id uuid,
  p_role text,
  p_parent_name text,
  p_enforce_single_slot boolean default false
)
returns setof public.program_coop_teaching_schedule_weeks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_normalized text;
begin
  v_normalized := public.normalize_coop_family_name(p_parent_name);
  if v_normalized = '' or p_role not in ('instructor', 'assistant') then
    return;
  end if;

  if p_role = 'instructor' then
    return query
    update public.program_coop_teaching_schedule_weeks
    set parent_instructors = array_append(parent_instructors, v_normalized)
    where id = p_week_id
      and program_id = p_program_id
      and organization_id = p_organization_id
      and (not p_enforce_single_slot or cardinality(parent_instructors) = 0)
      and not exists (
        select 1
        from unnest(parent_instructors) as existing_parent(parent_name)
        where lower(existing_parent.parent_name) = lower(v_normalized)
      )
    returning *;
  end if;

  return query
  update public.program_coop_teaching_schedule_weeks
  set parent_assistants = array_append(parent_assistants, v_normalized)
  where id = p_week_id
    and program_id = p_program_id
    and organization_id = p_organization_id
    and (not p_enforce_single_slot or cardinality(parent_assistants) = 0)
    and not exists (
      select 1
      from unnest(parent_assistants) as existing_parent(parent_name)
      where lower(existing_parent.parent_name) = lower(v_normalized)
    )
  returning *;
end;
$$;

grant execute on function public.append_program_coop_supply_assigned_family(
  uuid, uuid, uuid, text
) to authenticated, service_role;

grant execute on function public.append_program_coop_teaching_schedule_parent(
  uuid, uuid, uuid, text, text, boolean
) to authenticated, service_role;
