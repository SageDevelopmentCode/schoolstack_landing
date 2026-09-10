-- Promoted to supabase/migrations/20260917_coop_family_id_signups.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.program_coop_supply_items
  add column if not exists assigned_family_ids uuid[] not null default '{}';

alter table public.program_coop_teaching_schedule_weeks
  add column if not exists instructor_family_ids uuid[] not null default '{}',
  add column if not exists assistant_family_ids uuid[] not null default '{}';

alter table public.program_coop_supply_items
  drop constraint if exists program_coop_supply_items_assigned_families_max;

alter table public.program_coop_supply_items
  drop constraint if exists program_coop_supply_items_assigned_family_ids_max;

alter table public.program_coop_supply_items
  add constraint program_coop_supply_items_assigned_family_ids_max
  check (cardinality(assigned_family_ids) <= 5);

drop function if exists public.append_program_coop_supply_assigned_family(
  uuid, uuid, uuid, text
);

drop function if exists public.append_program_coop_teaching_schedule_parent(
  uuid, uuid, uuid, text, text, boolean
);

create or replace function public.append_program_coop_supply_assigned_family(
  p_item_id uuid,
  p_program_id uuid,
  p_organization_id uuid,
  p_family_id uuid
)
returns setof public.program_coop_supply_items
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_family_id is null then
    return;
  end if;

  return query
  update public.program_coop_supply_items
  set assigned_family_ids = array_append(assigned_family_ids, p_family_id)
  where id = p_item_id
    and program_id = p_program_id
    and organization_id = p_organization_id
    and cardinality(assigned_family_ids) < 5
    and not (p_family_id = any (assigned_family_ids))
  returning *;
end;
$$;

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
  end if;

  return query
  update public.program_coop_teaching_schedule_weeks
  set assistant_family_ids = array_append(assistant_family_ids, p_family_id)
  where id = p_week_id
    and program_id = p_program_id
    and organization_id = p_organization_id
    and (not p_enforce_single_slot or cardinality(assistant_family_ids) = 0)
    and not (p_family_id = any (assistant_family_ids))
  returning *;
end;
$$;

grant execute on function public.append_program_coop_supply_assigned_family(
  uuid, uuid, uuid, uuid
) to authenticated, service_role;

grant execute on function public.append_program_coop_teaching_schedule_parent(
  uuid, uuid, uuid, text, uuid, boolean
) to authenticated, service_role;
