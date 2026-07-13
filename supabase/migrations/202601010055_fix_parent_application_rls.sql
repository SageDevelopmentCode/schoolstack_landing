-- Restrict parent org memberships from staff-level read access on PII tables.
-- Parents retain access through guardian-scoped policies.

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
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner', 'admin', 'teacher', 'staff')
  );
$$;

-- ── families ──────────────────────────────────────────────────────────────────

drop policy if exists "Org members can read families" on public.families;

create policy "Staff can read families"
  on public.families
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Guardians can read own family"
  on public.families
  for select
  to authenticated
  using (public.user_is_guardian_for_family(id));

-- ── guardians ─────────────────────────────────────────────────────────────────

drop policy if exists "Org members can read guardians" on public.guardians;

create policy "Staff can read guardians"
  on public.guardians
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Guardians can read own guardians"
  on public.guardians
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.user_is_guardian_for_family(family_id)
  );

-- ── students ──────────────────────────────────────────────────────────────────

drop policy if exists "Org members can read students" on public.students;

create policy "Staff can read students"
  on public.students
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Guardians can read own students"
  on public.students
  for select
  to authenticated
  using (public.user_is_guardian_for_student(id));

-- ── enrollments ───────────────────────────────────────────────────────────────

drop policy if exists "Org members can read enrollments" on public.enrollments;

create policy "Staff can read enrollments"
  on public.enrollments
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

create policy "Guardians can read own enrollments"
  on public.enrollments
  for select
  to authenticated
  using (public.user_is_guardian_for_enrollment(id));

-- ── applications ──────────────────────────────────────────────────────────────

drop policy if exists "Org members can read applications" on public.applications;

create policy "Staff can read applications"
  on public.applications
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

-- ── application_files ─────────────────────────────────────────────────────────

drop policy if exists "Org members can read application_files" on public.application_files;

create policy "Staff can read application_files"
  on public.application_files
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

-- ── enrollment_checklists ─────────────────────────────────────────────────────

drop policy if exists "Org members can read enrollment_checklists" on public.enrollment_checklists;

create policy "Staff can read enrollment_checklists"
  on public.enrollment_checklists
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

-- ── enrollment_checklist_items ────────────────────────────────────────────────

drop policy if exists "Org members can read enrollment_checklist_items" on public.enrollment_checklist_items;

create policy "Staff can read enrollment_checklist_items"
  on public.enrollment_checklist_items
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

-- ── admissions_scheduled_visits ───────────────────────────────────────────────

drop policy if exists "Org members can read admissions_scheduled_visits" on public.admissions_scheduled_visits;

create policy "Staff can read admissions_scheduled_visits"
  on public.admissions_scheduled_visits
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));
