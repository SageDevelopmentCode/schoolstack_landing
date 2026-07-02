-- Product foundation: RLS policies for tenant layer
-- Run after: add_product_rls_helpers.sql

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_settings enable row level security;

-- ── organizations ─────────────────────────────────────────────────────────────

create policy "Platform admins manage organizations"
  on public.organizations
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read their organization"
  on public.organizations
  for select
  to authenticated
  using (public.user_is_active_org_member(id));

create policy "Org admins can update their organization"
  on public.organizations
  for update
  to authenticated
  using (public.user_is_org_admin(id))
  with check (public.user_is_org_admin(id));

-- ── organization_memberships ──────────────────────────────────────────────────

create policy "Platform admins manage memberships"
  on public.organization_memberships
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read memberships in their org"
  on public.organization_memberships
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert memberships"
  on public.organization_memberships
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update memberships"
  on public.organization_memberships
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete memberships"
  on public.organization_memberships
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── organization_settings ─────────────────────────────────────────────────────

create policy "Platform admins manage organization settings"
  on public.organization_settings
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read organization settings"
  on public.organization_settings
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert organization settings"
  on public.organization_settings
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update organization settings"
  on public.organization_settings
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
