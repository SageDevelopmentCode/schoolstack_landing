-- Product foundation: RLS policies for people and operations tables
-- Run after: add_product_enrollments.sql

alter table public.families enable row level security;
alter table public.guardians enable row level security;
alter table public.students enable row level security;
alter table public.staff_members enable row level security;
alter table public.programs enable row level security;
alter table public.classrooms enable row level security;
alter table public.enrollments enable row level security;

-- ── families ──────────────────────────────────────────────────────────────────

create policy "Platform admins manage families"
  on public.families
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read families"
  on public.families
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert families"
  on public.families
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update families"
  on public.families
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete families"
  on public.families
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── guardians ─────────────────────────────────────────────────────────────────

create policy "Platform admins manage guardians"
  on public.guardians
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read guardians"
  on public.guardians
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert guardians"
  on public.guardians
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update guardians"
  on public.guardians
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete guardians"
  on public.guardians
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── students ──────────────────────────────────────────────────────────────────

create policy "Platform admins manage students"
  on public.students
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read students"
  on public.students
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert students"
  on public.students
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update students"
  on public.students
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete students"
  on public.students
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── staff_members ─────────────────────────────────────────────────────────────

create policy "Platform admins manage staff_members"
  on public.staff_members
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read staff_members"
  on public.staff_members
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert staff_members"
  on public.staff_members
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update staff_members"
  on public.staff_members
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete staff_members"
  on public.staff_members
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── programs ──────────────────────────────────────────────────────────────────

create policy "Platform admins manage programs"
  on public.programs
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read programs"
  on public.programs
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert programs"
  on public.programs
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update programs"
  on public.programs
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete programs"
  on public.programs
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── classrooms ────────────────────────────────────────────────────────────────

create policy "Platform admins manage classrooms"
  on public.classrooms
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read classrooms"
  on public.classrooms
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert classrooms"
  on public.classrooms
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update classrooms"
  on public.classrooms
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete classrooms"
  on public.classrooms
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));

-- ── enrollments ───────────────────────────────────────────────────────────────

create policy "Platform admins manage enrollments"
  on public.enrollments
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read enrollments"
  on public.enrollments
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert enrollments"
  on public.enrollments
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update enrollments"
  on public.enrollments
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can delete enrollments"
  on public.enrollments
  for delete
  to authenticated
  using (public.user_is_org_admin(organization_id));


-- =============================================================================
-- Optional bootstrap: Rooted Meadows (commented — run manually in SQL Editor)
-- =============================================================================
--
-- Step 1: Create the organization
--
-- insert into public.organizations (slug, name, status, timezone, crm_school_id)
-- values (
--   'rooted-meadows-school',
--   'Rooted Meadows Waldorf School',
--   'onboarding',
--   'America/Chicago',
--   'rooted-meadows-school'
-- )
-- returning id;
--
-- Step 2: Default settings (branding from rootedmeadows-admin-demo.ts)
--
-- insert into public.organization_settings (organization_id, branding, features)
-- values (
--   'PASTE-ORG-UUID-HERE',
--   '{
--     "logo": {
--       "src": "/images/demo/rootedmeadows/Main+Logo.webp",
--       "alt": "Rooted Meadows Waldorf School",
--       "width": 200,
--       "height": 58
--     },
--     "colors": {
--       "bg": "#FAF8F4",
--       "border": "#E8E0D4",
--       "borderStrong": "#D4C9BA",
--       "accent": "#827096",
--       "accentBright": "#6E5D7F",
--       "accentLight": "rgba(130, 112, 150, 0.10)",
--       "accentMid": "#6E5D7F",
--       "accentDark": "#5A4D68",
--       "clay": "#b3b462",
--       "textPrimary": "#2b2a26",
--       "textSecondary": "#6B6560"
--     }
--   }'::jsonb,
--   '{
--     "committees": true,
--     "payroll": false
--   }'::jsonb
-- );
--
-- Step 3: Add the school's first owner (user must exist in auth.users)
--
-- insert into public.organization_memberships (organization_id, user_id, role, status)
-- values (
--   'PASTE-ORG-UUID-HERE',
--   'PASTE-AUTH-USER-UUID-HERE',
--   'owner',
--   'active'
-- );
--
-- Find auth user UUID:
--   select id, email from auth.users where email = 'admin@example.com';
