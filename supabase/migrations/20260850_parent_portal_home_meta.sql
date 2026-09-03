-- Lean aggregates for parent portal home initial load
-- Run after: 20260849_parent_billing_page_meta.sql

create or replace function public.parent_portal_home_meta(
  p_organization_id uuid,
  p_family_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_children_count integer := 0;
  v_enrolled_children_count integer := 0;
begin
  select count(*)::integer
  into v_children_count
  from public.applications a
  where a.organization_id = p_organization_id
    and a.family_id = p_family_id
    and a.status not in ('withdrawn', 'declined');

  select count(*)::integer
  into v_enrolled_children_count
  from public.applications a
  where a.organization_id = p_organization_id
    and a.family_id = p_family_id
    and a.status = 'enrolled';

  return jsonb_build_object(
    'children_count', v_children_count,
    'enrolled_children_count', v_enrolled_children_count
  );
end;
$$;

grant execute on function public.parent_portal_home_meta(uuid, uuid) to authenticated;
