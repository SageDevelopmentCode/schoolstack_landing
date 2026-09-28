-- Promoted to supabase/migrations/20261103_portal_link_membership_helpers.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create or replace function public.portal_account_link_peer_user_ids(p_organization_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid()
  union
  select m2.user_id
  from public.organization_portal_account_link_members m1
  join public.organization_portal_account_link_members m2
    on m2.group_id = m1.group_id
   and m2.organization_id = m1.organization_id
  where m1.organization_id = p_organization_id
    and m1.user_id = auth.uid();
$$;

create or replace function public.user_is_active_org_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_organization_id
      and m.user_id in (
        select public.portal_account_link_peer_user_ids(p_organization_id)
      )
      and m.status = 'active'
  );
$$;

create or replace function public.user_is_org_admin(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_organization_id
      and m.user_id in (
        select public.portal_account_link_peer_user_ids(p_organization_id)
      )
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  );
$$;

create or replace function public.user_is_staff_org_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = p_organization_id
      and m.user_id in (
        select public.portal_account_link_peer_user_ids(p_organization_id)
      )
      and m.status = 'active'
      and m.role in ('owner', 'admin', 'teacher', 'staff')
  );
$$;
