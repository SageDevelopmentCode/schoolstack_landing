-- Atomic remove RPCs for co-op supply list and teaching schedule parent sign-ups.
-- Run after: 20260917_coop_family_id_signups.sql

create or replace function public.remove_program_coop_supply_assigned_family(
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
  set assigned_family_ids = array_remove(assigned_family_ids, p_family_id)
  where id = p_item_id
    and program_id = p_program_id
    and organization_id = p_organization_id
    and p_family_id = any (assigned_family_ids)
  returning *;
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

grant execute on function public.remove_program_coop_supply_assigned_family(
  uuid, uuid, uuid, uuid
) to authenticated, service_role;

grant execute on function public.remove_program_coop_teaching_schedule_parent(
  uuid, uuid, uuid, text, uuid
) to authenticated, service_role;
