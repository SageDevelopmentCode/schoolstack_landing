-- Promoted to supabase/migrations/20260839_add_schedule_event_permissions.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.organization_settings
  add column if not exists schedule jsonb not null default '{}'::jsonb;

create or replace function public.user_can_manage_organization_events(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or public.user_is_org_admin(p_organization_id)
    or (
      public.user_is_staff_org_member(p_organization_id)
      and exists (
        select 1
        from public.organization_memberships om
        cross join public.organization_settings os
        where om.organization_id = p_organization_id
          and om.user_id = auth.uid()
          and om.status = 'active'
          and om.role in ('teacher', 'staff')
          and os.organization_id = p_organization_id
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
              public.user_staff_member_id_for_org(p_organization_id) is not null
              and (os.schedule -> 'event_permissions' -> 'staff_member_ids') @>
                to_jsonb(public.user_staff_member_id_for_org(p_organization_id)::text)
            )
          )
      )
    );
$$;

drop policy if exists "Authorized staff manage organization_events" on public.organization_events;

create policy "Authorized staff manage organization_events"
  on public.organization_events for all to authenticated
  using (public.user_can_manage_organization_events(organization_id))
  with check (public.user_can_manage_organization_events(organization_id));
