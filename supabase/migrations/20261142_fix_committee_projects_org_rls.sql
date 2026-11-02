-- Tie committee project RLS to committee org, not client-supplied organization_id.
-- Run after: 20261141_expand_push_newsletter_kind.sql

create or replace function public.committee_project_organization_id(p_project_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select public.committee_organization_id(p.committee_id)
  from public.committee_projects p
  where p.id = p_project_id
  limit 1;
$$;

-- ── committee_projects ──────────────────────────────────────────────────────

drop policy if exists "Staff read committee_projects" on public.committee_projects;
create policy "Staff read committee_projects"
  on public.committee_projects for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_organization_id(committee_id))
  );

drop policy if exists "Org admins manage committee_projects" on public.committee_projects;
create policy "Org admins manage committee_projects"
  on public.committee_projects for all to authenticated
  using (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  )
  with check (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  );

drop policy if exists "Committee members create committee_projects" on public.committee_projects;
create policy "Committee members create committee_projects"
  on public.committee_projects for insert to authenticated
  with check (
    public.user_is_committee_member(committee_id)
    and organization_id = public.committee_organization_id(committee_id)
    and (
      created_by_member_id is null
      or created_by_member_id = public.user_committee_member_id(committee_id)
    )
  );

drop policy if exists "Committee members update committee_projects" on public.committee_projects;
create policy "Committee members update committee_projects"
  on public.committee_projects for update to authenticated
  using (public.user_is_committee_member(committee_id))
  with check (
    public.user_is_committee_member(committee_id)
    and organization_id = public.committee_organization_id(committee_id)
  );

-- ── committee_project_supply_color_legend ───────────────────────────────────

drop policy if exists "Staff read committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend;
create policy "Staff read committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_project_organization_id(project_id))
  );

drop policy if exists "Org admins manage committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend;
create policy "Org admins manage committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for all to authenticated
  using (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  )
  with check (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  );

drop policy if exists "Committee members write committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend;
create policy "Committee members write committee_project_supply_color_legend"
  on public.committee_project_supply_color_legend for all to authenticated
  using (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
  )
  with check (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
    and organization_id = public.committee_project_organization_id(project_id)
  );

-- ── committee_project_supply_items ──────────────────────────────────────────

drop policy if exists "Staff read committee_project_supply_items"
  on public.committee_project_supply_items;
create policy "Staff read committee_project_supply_items"
  on public.committee_project_supply_items for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_project_organization_id(project_id))
  );

drop policy if exists "Org admins manage committee_project_supply_items"
  on public.committee_project_supply_items;
create policy "Org admins manage committee_project_supply_items"
  on public.committee_project_supply_items for all to authenticated
  using (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  )
  with check (
    public.user_is_org_admin(public.committee_project_organization_id(project_id))
  );

drop policy if exists "Committee members write committee_project_supply_items"
  on public.committee_project_supply_items;
create policy "Committee members write committee_project_supply_items"
  on public.committee_project_supply_items for all to authenticated
  using (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
  )
  with check (
    public.user_is_committee_member(public.committee_project_committee_id(project_id))
    and organization_id = public.committee_project_organization_id(project_id)
  );
