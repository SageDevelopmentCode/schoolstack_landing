-- Phase 1b step 3 (safe tier) of docs/parent-portal-audit.md (finding C3).
--
-- user_is_active_org_member() matches ANY active membership, including role = 'parent'. These
-- tables are never read by a parent with their own session (parent routes use the service role
-- for classroom signups, committees, teachers and availability; the mobile app reads them only in
-- school-admin / teacher screens; parents read branding through organization_settings_public,
-- which is security_invoker = false). Their "Org members ..." SELECT policies are replaced with
-- staff-only reads (owner / admin / teacher / staff via user_is_staff_org_member), so teachers keep
-- access. Writes are unaffected ("Org admins manage ..." / "Platform admins manage ...").
--
-- Run after: Phase 1b steps 1-2 and the Phase 3 code deploy (already live).
-- No code deploy is required.
--
-- NOT in this file (parents still read these with their own client; each needs a narrow policy or a
-- code change first): admissions_observation_slots, admissions_observation_slot_grades,
-- admissions_scheduled_visit_days, document_templates, fee_definitions, tuition_rate_plans,
-- tuition_rate_tiers, tuition_payment_plans, tuition_fee_components, organizations,
-- organization_memberships, programs, application_form_versions, checklist templates and items.

drop policy if exists "Org members can read staff_members" on public.staff_members;
drop policy if exists "Staff read staff_members" on public.staff_members;
create policy "Staff read staff_members"
  on public.staff_members
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read student_teacher_assignments" on public.student_teacher_assignments;
drop policy if exists "Staff read student_teacher_assignments" on public.student_teacher_assignments;
create policy "Staff read student_teacher_assignments"
  on public.student_teacher_assignments
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read classroom_staff_assignments" on public.classroom_staff_assignments;
drop policy if exists "Staff read classroom_staff_assignments" on public.classroom_staff_assignments;
create policy "Staff read classroom_staff_assignments"
  on public.classroom_staff_assignments
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members can read classrooms" on public.classrooms;
drop policy if exists "Staff read classrooms" on public.classrooms;
create policy "Staff read classrooms"
  on public.classrooms
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read classroom_signups" on public.classroom_signups;
drop policy if exists "Staff read classroom_signups" on public.classroom_signups;
create policy "Staff read classroom_signups"
  on public.classroom_signups
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read enrollment_classrooms" on public.enrollment_classrooms;
drop policy if exists "Staff read enrollment_classrooms" on public.enrollment_classrooms;
create policy "Staff read enrollment_classrooms"
  on public.enrollment_classrooms
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members can read organization settings" on public.organization_settings;
drop policy if exists "Staff read organization_settings" on public.organization_settings;
create policy "Staff read organization_settings"
  on public.organization_settings
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members can read admissions_availability_slots" on public.admissions_availability_slots;
drop policy if exists "Staff read admissions_availability_slots" on public.admissions_availability_slots;
create policy "Staff read admissions_availability_slots"
  on public.admissions_availability_slots
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members can read admissions_observation_day_availability" on public.admissions_observation_day_availability;
drop policy if exists "Staff read admissions_observation_day_availability" on public.admissions_observation_day_availability;
create policy "Staff read admissions_observation_day_availability"
  on public.admissions_observation_day_availability
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members can read application_form_version_revisions" on public.application_form_version_revisions;
drop policy if exists "Staff read application_form_version_revisions" on public.application_form_version_revisions;
create policy "Staff read application_form_version_revisions"
  on public.application_form_version_revisions
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_adjustment_rules" on public.tuition_adjustment_rules;
drop policy if exists "Staff read tuition_adjustment_rules" on public.tuition_adjustment_rules;
create policy "Staff read tuition_adjustment_rules"
  on public.tuition_adjustment_rules
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_late_fee_overrides" on public.tuition_late_fee_overrides;
drop policy if exists "Staff read tuition_late_fee_overrides" on public.tuition_late_fee_overrides;
create policy "Staff read tuition_late_fee_overrides"
  on public.tuition_late_fee_overrides
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

-- committee_templates: organization_id is null rows are platform-default templates (no school
-- data); they stay readable to any signed-in user, as before. School templates become staff-only.
drop policy if exists "Org members read committee_templates" on public.committee_templates;
drop policy if exists "Staff read committee_templates" on public.committee_templates;
create policy "Staff read committee_templates"
  on public.committee_templates
  for select
  to authenticated
  using (
    organization_id is null
    or public.user_is_staff_org_member(organization_id)
  );
