-- List pending + bounded history for staff hours adjustments in one snapshot.
-- Run after: 20261163_create_free_school_atomic.sql

create or replace function public.list_staff_hours_adjustment_requests_for_org(
  p_organization_id uuid,
  p_history_limit integer default 100
)
returns setof public.staff_hours_adjustment_requests
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.staff_hours_adjustment_requests r
  where r.organization_id = p_organization_id
    and (
      r.status = 'pending'
      or r.id in (
        select h.id
        from public.staff_hours_adjustment_requests h
        where h.organization_id = p_organization_id
          and h.status <> 'pending'
        order by h.created_at desc
        limit greatest(p_history_limit, 0)
      )
    )
  order by r.created_at desc;
$$;

revoke all on function public.list_staff_hours_adjustment_requests_for_org(uuid, integer)
  from public, anon, authenticated;

grant execute on function public.list_staff_hours_adjustment_requests_for_org(uuid, integer)
  to service_role;
