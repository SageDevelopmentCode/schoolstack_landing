-- Promoted to supabase/migrations/20261102_fix_portal_account_link_members_rls.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Fixes: infinite recursion detected in policy for relation organization_portal_account_link_members (42P17)

create or replace function public.user_is_portal_account_link_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_portal_account_link_members m
    where m.group_id = p_group_id
      and m.user_id = auth.uid()
  );
$$;

drop policy if exists "Link group members can read groups"
  on public.organization_portal_account_link_groups;

create policy "Link group members can read groups"
  on public.organization_portal_account_link_groups
  for select
  to authenticated
  using (
    public.user_is_portal_account_link_member(id)
    or public.is_platform_admin()
  );

drop policy if exists "Link group members can read members"
  on public.organization_portal_account_link_members;

create policy "Link group members can read members"
  on public.organization_portal_account_link_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.user_is_portal_account_link_member(group_id)
    or public.is_platform_admin()
  );
