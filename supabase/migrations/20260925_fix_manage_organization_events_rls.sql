-- Harden organization event manage RLS for individually granted teachers/staff.
-- Run after: 20260924_add_enrollment_enrolled_at.sql

create or replace function public.user_can_manage_organization_events(p_organization_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.is_platform_admin() then
    return true;
  end if;

  if public.user_is_org_admin(p_organization_id) then
    return true;
  end if;

  if not public.user_is_staff_org_member(p_organization_id) then
    return false;
  end if;

  return exists (
    select 1
    from public.organization_memberships om
    join public.organization_settings os
      on os.organization_id = om.organization_id
    left join public.staff_members sm
      on sm.organization_id = om.organization_id
     and sm.user_id = om.user_id
    where om.organization_id = p_organization_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role in ('teacher', 'staff')
      and (
        (
          om.role = 'teacher'
          and coalesce(
            (os.schedule -> 'event_permissions' -> 'roles' ->> 'teacher')::boolean,
            false
          )
        )
        or (
          om.role = 'staff'
          and coalesce(
            (os.schedule -> 'event_permissions' -> 'roles' ->> 'staff')::boolean,
            false
          )
        )
        or (
          sm.id is not null
          and exists (
            select 1
            from jsonb_array_elements_text(
              coalesce(
                os.schedule -> 'event_permissions' -> 'staff_member_ids',
                '[]'::jsonb
              )
            ) as granted(id)
            where granted.id = sm.id::text
          )
        )
      )
  );
end;
$$;

grant execute on function public.user_can_manage_organization_events(uuid) to public;
