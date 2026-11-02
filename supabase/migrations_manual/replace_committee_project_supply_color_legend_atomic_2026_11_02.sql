-- Promoted to supabase/migrations/20261143_replace_committee_project_supply_color_legend_atomic.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Atomic replace of committee project supply color legend (delete + insert in one transaction).
-- Run after: fix_committee_projects_org_rls_2026_11_02.sql

create or replace function public.replace_committee_project_supply_color_legend(
  p_project_id uuid,
  p_organization_id uuid,
  p_legend jsonb default '[]'::jsonb
)
returns setof public.committee_project_supply_color_legend
language plpgsql
set search_path = public
as $$
begin
  if p_organization_id is distinct from public.committee_project_organization_id(p_project_id) then
    raise exception 'organization_mismatch'
      using errcode = 'P0001';
  end if;

  delete from public.committee_project_supply_color_legend
  where project_id = p_project_id;

  if p_legend is not null and jsonb_typeof(p_legend) = 'array' and jsonb_array_length(p_legend) > 0 then
    insert into public.committee_project_supply_color_legend (
      project_id,
      organization_id,
      color_id,
      hex,
      label,
      sort_order
    )
    select
      p_project_id,
      p_organization_id,
      coalesce(entry->>'id', ''),
      coalesce(entry->>'hex', ''),
      coalesce(entry->>'label', ''),
      (ordinality - 1)::int
    from jsonb_array_elements(p_legend) with ordinality as t(entry, ordinality);
  end if;

  return query
  select l.*
  from public.committee_project_supply_color_legend l
  where l.project_id = p_project_id
  order by l.sort_order asc;
end;
$$;

revoke all on function public.replace_committee_project_supply_color_legend(uuid, uuid, jsonb)
  from public;

grant execute on function public.replace_committee_project_supply_color_legend(uuid, uuid, jsonb)
  to authenticated;
