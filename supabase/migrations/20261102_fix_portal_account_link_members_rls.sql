-- Fix infinite RLS recursion (42P17) on organization_portal_account_link_members.
-- Run after: 20261101_add_organization_portal_account_links.sql

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
