-- Promoted to supabase/migrations/20261151_staff_only_reads_phase1b_step3.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08 — Phase 1b step 3, safe tier (docs/parent-portal-audit.md, finding C3).
--
-- PREREQUISITE: Phase 1b steps 1-2 applied and the Phase 1-3 code deployed (it is).
-- This file REMOVES broad "Org members read ..." policies on 13 tables nothing parent-facing reads.
-- RLS tightening shows up as empty data, not errors, so use the dry run first.
--
-- HOW TO RUN SAFELY
--   1. Dry run (bottom of file): counts rows per table as a parent, a linked login, a teacher and an
--      admin. Always rolls back. Expect 0 for the parent and linked login, more than 0 for staff.
--   2. Run between the "=== MIGRATION ===" markers.
--   3. Smoke-check (rooted-meadows-demo first, then rooted-meadows):
--        school admin: staff list, classrooms, classroom signups, shadow-day / admissions settings,
--        tuition rules; teacher: My Students and classroom roster (web and mobile);
--        parent: home, messages, committees, classroom signup, children.
--   4. If anything is empty that should not be, run the ROLLBACK block immediately.
--
-- === MIGRATION START ===

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

-- === MIGRATION END ===

-- ===========================================================================
-- DRY RUN (copy this whole block; it never commits)
-- ===========================================================================
--
-- begin;
--
--   -- >>> paste the MIGRATION body here <<<
--
--   create temp table _dry (k text primary key, v text) on commit drop;
--   grant all on _dry to public;
--
--   insert into _dry select 'org', o.id::text from public.organizations o where o.slug = 'rooted-meadows-demo';
--
--   insert into _dry
--   select 'parent_user', g.user_id::text from public.guardians g
--   where g.organization_id = (select v::uuid from _dry where k = 'org') and g.user_id is not null limit 1;
--
--   insert into _dry
--   select 'peer_user', m.user_id::text from public.organization_portal_account_link_members m
--   where m.organization_id = (select v::uuid from _dry where k = 'org')
--     and not exists (select 1 from public.guardians g where g.user_id = m.user_id and g.organization_id = m.organization_id)
--   limit 1;
--
--   insert into _dry
--   select 'admin_user', m.user_id::text from public.organization_memberships m
--   where m.organization_id = (select v::uuid from _dry where k = 'org') and m.status = 'active' and m.role in ('owner','admin') limit 1;
--
--   insert into _dry
--   select 'teacher_user', m.user_id::text from public.organization_memberships m
--   where m.organization_id = (select v::uuid from _dry where k = 'org') and m.status = 'active' and m.role = 'teacher' limit 1;
--
--   select * from _dry;
--
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='parent_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.staff_members; raise notice 'parent staff_members visible=% (expect 0)', n;
--     select count(*) into n from public.student_teacher_assignments; raise notice 'parent student_teacher_assignments visible=% (expect 0)', n;
--     select count(*) into n from public.classroom_staff_assignments; raise notice 'parent classroom_staff_assignments visible=% (expect 0)', n;
--     select count(*) into n from public.classrooms; raise notice 'parent classrooms visible=% (expect 0)', n;
--     select count(*) into n from public.classroom_signups; raise notice 'parent classroom_signups visible=% (expect 0)', n;
--     select count(*) into n from public.enrollment_classrooms; raise notice 'parent enrollment_classrooms visible=% (expect 0)', n;
--     select count(*) into n from public.organization_settings; raise notice 'parent organization_settings visible=% (expect 0)', n;
--     select count(*) into n from public.admissions_availability_slots; raise notice 'parent admissions_availability_slots visible=% (expect 0)', n;
--     select count(*) into n from public.admissions_observation_day_availability; raise notice 'parent admissions_observation_day_availability visible=% (expect 0)', n;
--     select count(*) into n from public.application_form_version_revisions; raise notice 'parent application_form_version_revisions visible=% (expect 0)', n;
--     select count(*) into n from public.tuition_adjustment_rules; raise notice 'parent tuition_adjustment_rules visible=% (expect 0)', n;
--     select count(*) into n from public.tuition_late_fee_overrides; raise notice 'parent tuition_late_fee_overrides visible=% (expect 0)', n;
--     select count(*) into n from public.committee_templates; raise notice 'parent committee_templates visible=% (expect 0)', n;
--   end $$;
--   reset role;
--
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='peer_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.staff_members; raise notice 'peer staff_members visible=% (expect 0)', n;
--     select count(*) into n from public.student_teacher_assignments; raise notice 'peer student_teacher_assignments visible=% (expect 0)', n;
--     select count(*) into n from public.classroom_staff_assignments; raise notice 'peer classroom_staff_assignments visible=% (expect 0)', n;
--     select count(*) into n from public.classrooms; raise notice 'peer classrooms visible=% (expect 0)', n;
--     select count(*) into n from public.classroom_signups; raise notice 'peer classroom_signups visible=% (expect 0)', n;
--     select count(*) into n from public.enrollment_classrooms; raise notice 'peer enrollment_classrooms visible=% (expect 0)', n;
--     select count(*) into n from public.organization_settings; raise notice 'peer organization_settings visible=% (expect 0)', n;
--     select count(*) into n from public.admissions_availability_slots; raise notice 'peer admissions_availability_slots visible=% (expect 0)', n;
--     select count(*) into n from public.admissions_observation_day_availability; raise notice 'peer admissions_observation_day_availability visible=% (expect 0)', n;
--     select count(*) into n from public.application_form_version_revisions; raise notice 'peer application_form_version_revisions visible=% (expect 0)', n;
--     select count(*) into n from public.tuition_adjustment_rules; raise notice 'peer tuition_adjustment_rules visible=% (expect 0)', n;
--     select count(*) into n from public.tuition_late_fee_overrides; raise notice 'peer tuition_late_fee_overrides visible=% (expect 0)', n;
--     select count(*) into n from public.committee_templates; raise notice 'peer committee_templates visible=% (expect 0)', n;
--   end $$;
--   reset role;
--
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='admin_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.staff_members; raise notice 'admin staff_members visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.student_teacher_assignments; raise notice 'admin student_teacher_assignments visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.classroom_staff_assignments; raise notice 'admin classroom_staff_assignments visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.classrooms; raise notice 'admin classrooms visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.classroom_signups; raise notice 'admin classroom_signups visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.enrollment_classrooms; raise notice 'admin enrollment_classrooms visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.organization_settings; raise notice 'admin organization_settings visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.admissions_availability_slots; raise notice 'admin admissions_availability_slots visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.admissions_observation_day_availability; raise notice 'admin admissions_observation_day_availability visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.application_form_version_revisions; raise notice 'admin application_form_version_revisions visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.tuition_adjustment_rules; raise notice 'admin tuition_adjustment_rules visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.tuition_late_fee_overrides; raise notice 'admin tuition_late_fee_overrides visible=% (expect all rows in the school; committee_templates includes global)', n;
--     select count(*) into n from public.committee_templates; raise notice 'admin committee_templates visible=% (expect all rows in the school; committee_templates includes global)', n;
--   end $$;
--   reset role;
--
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='teacher_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.staff_members; raise notice 'teacher staff_members visible=% (staff: same as before)', n;
--     select count(*) into n from public.student_teacher_assignments; raise notice 'teacher student_teacher_assignments visible=% (staff: same as before)', n;
--     select count(*) into n from public.classroom_staff_assignments; raise notice 'teacher classroom_staff_assignments visible=% (staff: same as before)', n;
--     select count(*) into n from public.classrooms; raise notice 'teacher classrooms visible=% (staff: same as before)', n;
--     select count(*) into n from public.classroom_signups; raise notice 'teacher classroom_signups visible=% (staff: same as before)', n;
--     select count(*) into n from public.enrollment_classrooms; raise notice 'teacher enrollment_classrooms visible=% (staff: same as before)', n;
--     select count(*) into n from public.organization_settings; raise notice 'teacher organization_settings visible=% (staff: same as before)', n;
--     select count(*) into n from public.admissions_availability_slots; raise notice 'teacher admissions_availability_slots visible=% (staff: same as before)', n;
--     select count(*) into n from public.admissions_observation_day_availability; raise notice 'teacher admissions_observation_day_availability visible=% (staff: same as before)', n;
--     select count(*) into n from public.application_form_version_revisions; raise notice 'teacher application_form_version_revisions visible=% (staff: same as before)', n;
--     select count(*) into n from public.tuition_adjustment_rules; raise notice 'teacher tuition_adjustment_rules visible=% (staff: same as before)', n;
--     select count(*) into n from public.tuition_late_fee_overrides; raise notice 'teacher tuition_late_fee_overrides visible=% (staff: same as before)', n;
--     select count(*) into n from public.committee_templates; raise notice 'teacher committee_templates visible=% (staff: same as before)', n;
--   end $$;
--   reset role;
--
-- rollback;  -- never commit the dry run

-- ===========================================================================
-- ROLLBACK (restores the broad member-read policies; re-exposes these tables to all parents)
-- ===========================================================================
--
-- begin;
--   drop policy if exists "Staff read staff_members" on public.staff_members;
--   create policy "Org members can read staff_members" on public.staff_members
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read student_teacher_assignments" on public.student_teacher_assignments;
--   create policy "Org members read student_teacher_assignments" on public.student_teacher_assignments
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read classroom_staff_assignments" on public.classroom_staff_assignments;
--   create policy "Org members read classroom_staff_assignments" on public.classroom_staff_assignments
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read classrooms" on public.classrooms;
--   create policy "Org members can read classrooms" on public.classrooms
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read classroom_signups" on public.classroom_signups;
--   create policy "Org members read classroom_signups" on public.classroom_signups
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read enrollment_classrooms" on public.enrollment_classrooms;
--   create policy "Org members read enrollment_classrooms" on public.enrollment_classrooms
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read organization_settings" on public.organization_settings;
--   create policy "Org members can read organization settings" on public.organization_settings
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read admissions_availability_slots" on public.admissions_availability_slots;
--   create policy "Org members can read admissions_availability_slots" on public.admissions_availability_slots
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read admissions_observation_day_availability" on public.admissions_observation_day_availability;
--   create policy "Org members can read admissions_observation_day_availability" on public.admissions_observation_day_availability
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read application_form_version_revisions" on public.application_form_version_revisions;
--   create policy "Org members can read application_form_version_revisions" on public.application_form_version_revisions
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read tuition_adjustment_rules" on public.tuition_adjustment_rules;
--   create policy "Org members read tuition_adjustment_rules" on public.tuition_adjustment_rules
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read tuition_late_fee_overrides" on public.tuition_late_fee_overrides;
--   create policy "Org members read tuition_late_fee_overrides" on public.tuition_late_fee_overrides
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read committee_templates" on public.committee_templates;
--   create policy "Org members read committee_templates" on public.committee_templates
--     for select to authenticated
--     using (organization_id is null or public.user_is_active_org_member(organization_id));
-- commit;
