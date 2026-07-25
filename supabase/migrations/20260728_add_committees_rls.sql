-- Committees RLS policies
-- Run after: 20260726_add_committees_schema.sql

-- ── Helper: committee membership (for v2 parent portal) ──────────────────────

create or replace function public.user_is_committee_member(p_committee_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.committee_members m
    where m.committee_id = p_committee_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.committee_organization_id(p_committee_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.organization_id
  from public.committees c
  where c.id = p_committee_id
  limit 1;
$$;

-- ── committee_templates ──────────────────────────────────────────────────────

alter table public.committee_templates enable row level security;

create policy "Platform admins manage committee_templates"
  on public.committee_templates for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read committee_templates"
  on public.committee_templates for select to authenticated
  using (
    organization_id is null
    or public.user_is_active_org_member(organization_id)
  );

create policy "Org admins manage org committee_templates"
  on public.committee_templates for all to authenticated
  using (
    organization_id is not null
    and public.user_is_org_admin(organization_id)
  )
  with check (
    organization_id is not null
    and public.user_is_org_admin(organization_id)
  );

-- ── committees ───────────────────────────────────────────────────────────────

alter table public.committees enable row level security;

create policy "Platform admins manage committees"
  on public.committees for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committees"
  on public.committees for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Org admins manage committees"
  on public.committees for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── committee_members ────────────────────────────────────────────────────────

alter table public.committee_members enable row level security;

create policy "Platform admins manage committee_members"
  on public.committee_members for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_members"
  on public.committee_members for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Org admins manage committee_members"
  on public.committee_members for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── committee_duty_roles ─────────────────────────────────────────────────────

alter table public.committee_duty_roles enable row level security;

create policy "Platform admins manage committee_duty_roles"
  on public.committee_duty_roles for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_duty_roles"
  on public.committee_duty_roles for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_organization_id(committee_id))
  );

create policy "Org admins manage committee_duty_roles"
  on public.committee_duty_roles for all to authenticated
  using (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  )
  with check (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  );

-- ── committee_tasks ──────────────────────────────────────────────────────────

alter table public.committee_tasks enable row level security;

create policy "Platform admins manage committee_tasks"
  on public.committee_tasks for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_tasks"
  on public.committee_tasks for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_organization_id(committee_id))
  );

create policy "Org admins manage committee_tasks"
  on public.committee_tasks for all to authenticated
  using (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  )
  with check (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  );

-- ── committee_events ─────────────────────────────────────────────────────────

alter table public.committee_events enable row level security;

create policy "Platform admins manage committee_events"
  on public.committee_events for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_events"
  on public.committee_events for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_organization_id(committee_id))
  );

create policy "Org admins manage committee_events"
  on public.committee_events for all to authenticated
  using (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  )
  with check (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  );

-- ── committee_resources ──────────────────────────────────────────────────────

alter table public.committee_resources enable row level security;

create policy "Platform admins manage committee_resources"
  on public.committee_resources for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_resources"
  on public.committee_resources for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_organization_id(committee_id))
  );

create policy "Org admins manage committee_resources"
  on public.committee_resources for all to authenticated
  using (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  )
  with check (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  );

-- ── committee_messages ───────────────────────────────────────────────────────

alter table public.committee_messages enable row level security;

create policy "Platform admins manage committee_messages"
  on public.committee_messages for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read committee_messages"
  on public.committee_messages for select to authenticated
  using (
    public.user_is_staff_org_member(public.committee_organization_id(committee_id))
  );

create policy "Org admins manage committee_messages"
  on public.committee_messages for all to authenticated
  using (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  )
  with check (
    public.user_is_org_admin(public.committee_organization_id(committee_id))
  );
