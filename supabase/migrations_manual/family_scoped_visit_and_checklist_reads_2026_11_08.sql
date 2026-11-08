-- Promoted to supabase/migrations/20261155_family_scoped_visit_and_checklist_reads.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08 — family-scoped visit days, booked slots, and checklist embeds.
--
-- No app deploy is required. Availability and booking already use the service role.
-- Parents keep reading their own booked days and the agreement/fee on their checklist.
--
-- HOW TO RUN SAFELY
--   1. Dry run (bottom).
--   2. Run between the "=== MIGRATION ===" markers.
--   3. Smoke-check: apply dashboard visit dates, enrollment checklist agreement and fee,
--      school admin shadow-day settings. Roll back if a parent's own visit or checklist is empty.
--
-- === MIGRATION START ===

-- Phase 1b step 3 remainder: apply visit tables and checklist embeds
-- (docs/parent-portal-audit.md).
--
-- Parents still read booked visit days, the slots on those days, and the document
-- templates / fee definitions embedded in their own enrollment checklist. Availability
-- and booking routes already use the service role, so parents do not need to list
-- every slot in the school. Linked-account peers are included
-- (user_is_family_portal_member / portal_account_link_peer_user_ids).
--
-- Run after: 20261154_staff_only_tuition_catalog_reads.sql
-- No code deploy is required. The narrow policies are created before the broad ones
-- are dropped, in this same transaction.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.user_can_read_scheduled_visit(p_visit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admissions_scheduled_visits v
    where v.id = p_visit_id
      and (
        (
          v.family_id is not null
          and public.user_is_family_portal_member(v.family_id)
        )
        or exists (
          select 1
          from public.applications a
          where a.id = v.application_id
            and (
              a.created_by_user_id in (
                select public.portal_account_link_peer_user_ids(a.organization_id)
              )
              or (
                a.family_id is not null
                and public.user_is_family_portal_member(a.family_id)
              )
            )
        )
      )
  );
$$;

create or replace function public.user_can_read_observation_slot(p_slot_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admissions_observation_slots s
    where s.id = p_slot_id
      and (
        public.user_is_staff_org_member(s.organization_id)
        or exists (
          select 1
          from public.admissions_scheduled_visit_days d
          where d.observation_slot_id = s.id
            and public.user_can_read_scheduled_visit(d.scheduled_visit_id)
        )
      )
  );
$$;

-- A family portal member (including a linked login) who has a checklist for this template.
create or replace function public.user_can_read_checklist_template(p_template_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollment_checklists ec
    join public.enrollments e on e.id = ec.enrollment_id
    join public.students s on s.id = e.student_id
    where ec.template_id = p_template_id
      and s.family_id is not null
      and public.user_is_family_portal_member(s.family_id)
  );
$$;

revoke all on function public.user_can_read_scheduled_visit(uuid) from public, anon, authenticated;
grant execute on function public.user_can_read_scheduled_visit(uuid) to authenticated, service_role;

revoke all on function public.user_can_read_observation_slot(uuid) from public, anon, authenticated;
grant execute on function public.user_can_read_observation_slot(uuid) to authenticated, service_role;

revoke all on function public.user_can_read_checklist_template(uuid) from public, anon, authenticated;
grant execute on function public.user_can_read_checklist_template(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Visit days and the slots attached to a family's booked days
-- ---------------------------------------------------------------------------

drop policy if exists "Org members can read admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days;
drop policy if exists "Guardians can read own admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days;
drop policy if exists "Staff read admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days;
create policy "Staff read admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Families read own admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days;
create policy "Families read own admissions_scheduled_visit_days"
  on public.admissions_scheduled_visit_days
  for select
  to authenticated
  using (public.user_can_read_scheduled_visit(scheduled_visit_id));

drop policy if exists "Org members can read admissions_observation_slots"
  on public.admissions_observation_slots;
drop policy if exists "Staff read admissions_observation_slots"
  on public.admissions_observation_slots;
create policy "Staff read admissions_observation_slots"
  on public.admissions_observation_slots
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Families read booked admissions_observation_slots"
  on public.admissions_observation_slots;
create policy "Families read booked admissions_observation_slots"
  on public.admissions_observation_slots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admissions_scheduled_visit_days d
      where d.observation_slot_id = admissions_observation_slots.id
        and public.user_can_read_scheduled_visit(d.scheduled_visit_id)
    )
  );

drop policy if exists "Org members can read admissions_observation_slot_grades"
  on public.admissions_observation_slot_grades;
drop policy if exists "Families read booked admissions_observation_slot_grades"
  on public.admissions_observation_slot_grades;
create policy "Families read booked admissions_observation_slot_grades"
  on public.admissions_observation_slot_grades
  for select
  to authenticated
  using (public.user_can_read_observation_slot(slot_id));

-- ---------------------------------------------------------------------------
-- Checklist embeds: templates and fees linked to the family's checklist
-- ---------------------------------------------------------------------------

drop policy if exists "Org members can read document_templates" on public.document_templates;
drop policy if exists "Staff read document_templates" on public.document_templates;
create policy "Staff read document_templates"
  on public.document_templates
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Families read own checklist document_templates"
  on public.document_templates;
create policy "Families read own checklist document_templates"
  on public.document_templates
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.enrollment_checklist_template_items ti
      where ti.document_template_id = document_templates.id
        and public.user_can_read_checklist_template(ti.template_id)
    )
  );

drop policy if exists "Org members can read fee_definitions" on public.fee_definitions;
drop policy if exists "Staff read fee_definitions" on public.fee_definitions;
create policy "Staff read fee_definitions"
  on public.fee_definitions
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Families read own checklist fee_definitions"
  on public.fee_definitions;
create policy "Families read own checklist fee_definitions"
  on public.fee_definitions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.enrollment_checklist_template_items ti
      where ti.fee_definition_id = fee_definitions.id
        and public.user_can_read_checklist_template(ti.template_id)
    )
  );

-- === MIGRATION END ===

-- ===========================================================================
-- DRY RUN (copy this whole block; it never commits)
-- ===========================================================================
--
-- begin;
--   -- >>> paste the MIGRATION body here <<<
--   create temp table _dry (k text primary key, v text) on commit drop;
--   insert into _dry select 'org', o.id::text from public.organizations o where o.slug = 'rooted-meadows-demo';
--   insert into _dry
--   select 'parent_user', g.user_id::text from public.guardians g
--   where g.organization_id = (select v::uuid from _dry where k = 'org') and g.user_id is not null limit 1;
--   insert into _dry
--   select 'teacher_user', m.user_id::text from public.organization_memberships m
--   where m.organization_id = (select v::uuid from _dry where k = 'org') and m.status = 'active' and m.role = 'teacher' limit 1;
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='parent_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; alln int; begin
--     select count(*) into alln from public.admissions_observation_slots;
--     select count(*) into n from public.admissions_scheduled_visit_days;
--     raise notice 'parent observation slots=% (booked slots only, not every open slot) visit_days=%', alln, n;
--     select count(*) into n from public.document_templates;
--     raise notice 'parent document_templates=% (own checklist embeds only)', n;
--   end $$;
--   reset role;
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='teacher_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.admissions_observation_slots;
--     raise notice 'teacher observation slots=% (expect the school catalog)', n;
--   end $$;
--   reset role;
-- rollback;

-- ===========================================================================
-- ROLLBACK (restores broad member reads; drops the new helpers)
-- ===========================================================================
--
-- begin;
--   drop policy if exists "Staff read admissions_scheduled_visit_days" on public.admissions_scheduled_visit_days;
--   drop policy if exists "Families read own admissions_scheduled_visit_days" on public.admissions_scheduled_visit_days;
--   create policy "Org members can read admissions_scheduled_visit_days"
--     on public.admissions_scheduled_visit_days for select to authenticated
--     using (public.user_is_active_org_member(organization_id));
--   create policy "Guardians can read own admissions_scheduled_visit_days"
--     on public.admissions_scheduled_visit_days for select to authenticated
--     using (
--       exists (
--         select 1 from public.admissions_scheduled_visits v
--         join public.applications a on a.id = v.application_id
--         where v.id = scheduled_visit_id
--           and (
--             a.created_by_user_id = auth.uid()
--             or (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
--           )
--       )
--     );
--   drop policy if exists "Staff read admissions_observation_slots" on public.admissions_observation_slots;
--   drop policy if exists "Families read booked admissions_observation_slots" on public.admissions_observation_slots;
--   create policy "Org members can read admissions_observation_slots"
--     on public.admissions_observation_slots for select to authenticated
--     using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Families read booked admissions_observation_slot_grades" on public.admissions_observation_slot_grades;
--   create policy "Org members can read admissions_observation_slot_grades"
--     on public.admissions_observation_slot_grades for select to authenticated
--     using (
--       exists (
--         select 1 from public.admissions_observation_slots s
--         where s.id = slot_id and public.user_is_active_org_member(s.organization_id)
--       )
--     );
--   drop policy if exists "Staff read document_templates" on public.document_templates;
--   drop policy if exists "Families read own checklist document_templates" on public.document_templates;
--   create policy "Org members can read document_templates"
--     on public.document_templates for select to authenticated
--     using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read fee_definitions" on public.fee_definitions;
--   drop policy if exists "Families read own checklist fee_definitions" on public.fee_definitions;
--   create policy "Org members can read fee_definitions"
--     on public.fee_definitions for select to authenticated
--     using (public.user_is_active_org_member(organization_id));
--   drop function if exists public.user_can_read_checklist_template(uuid);
--   drop function if exists public.user_can_read_observation_slot(uuid);
--   drop function if exists public.user_can_read_scheduled_visit(uuid);
-- commit;
