-- Promoted to supabase/migrations/20261178_rls_initplan_and_fk_indexes.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Wrapped in one transaction: if any statement fails, no policy is left dropped.
-- Reviewed against remote pg_policies on 2026-11-27: all 13 policies match except the
-- (select auth.uid()) wrapping; none of the 7 index names or single-column indexes exist yet.

begin;

-- Original header: see the promoted migration.
-- Run after: 20261177_schools_letter_ready_at.sql

-- ── applications ──────────────────────────────────────────────────────────────

drop policy if exists "Guardians can read own applications" on public.applications;
create policy "Guardians can read own applications"
  on public.applications
  for select
  to authenticated
  using (
    (family_id is not null and public.user_is_guardian_for_family(family_id))
    or created_by_user_id = (select auth.uid())
  );

drop policy if exists "Guardians can insert own applications" on public.applications;
create policy "Guardians can insert own applications"
  on public.applications
  for insert
  to authenticated
  with check (
    public.user_is_active_org_member(organization_id)
    and (
      family_id is null
      or public.user_is_guardian_for_family(family_id)
    )
    and (created_by_user_id is null or created_by_user_id = (select auth.uid()))
  );

drop policy if exists "Guardians can update own applications" on public.applications;
create policy "Guardians can update own applications"
  on public.applications
  for update
  to authenticated
  using (
    (family_id is not null and public.user_is_guardian_for_family(family_id))
    or created_by_user_id = (select auth.uid())
  )
  with check (
    (family_id is null or public.user_is_guardian_for_family(family_id))
    and (created_by_user_id is null or created_by_user_id = (select auth.uid()))
  );

-- ── enrollment_checklist_items ────────────────────────────────────────────────

drop policy if exists "Guardians can update own enrollment checklist items"
  on public.enrollment_checklist_items;
create policy "Guardians can update own enrollment checklist items"
  on public.enrollment_checklist_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.enrollment_checklists ec
      where ec.id = checklist_id
        and public.user_is_guardian_for_enrollment(ec.enrollment_id)
    )
  )
  with check (
    exists (
      select 1
      from public.enrollment_checklists ec
      where ec.id = checklist_id
        and public.user_is_guardian_for_enrollment(ec.enrollment_id)
    )
    and (completed_by_user_id is null or completed_by_user_id = (select auth.uid()))
  );

-- ── application_payments ──────────────────────────────────────────────────────

drop policy if exists "Guardians can read own application_payments" on public.application_payments;
create policy "Guardians can read own application_payments"
  on public.application_payments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = (select auth.uid())
        )
    )
  );

-- ── activity_events ───────────────────────────────────────────────────────────

drop policy if exists "Authenticated users insert activity_events" on public.activity_events;
create policy "Authenticated users insert activity_events"
  on public.activity_events
  for insert
  to authenticated
  with check (actor_user_id is null or actor_user_id = (select auth.uid()));

-- ── guardians ─────────────────────────────────────────────────────────────────

drop policy if exists "Guardians can read own guardians" on public.guardians;
create policy "Guardians can read own guardians"
  on public.guardians
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.user_is_guardian_for_family(family_id)
  );

-- ── tuition_charges ───────────────────────────────────────────────────────────

drop policy if exists "Guardians read own tuition_charges" on public.tuition_charges;
create policy "Guardians read own tuition_charges"
  on public.tuition_charges
  for select
  to authenticated
  using (
    public.user_is_guardian_for_family(family_id)
    and (
      guardian_id is null
      or exists (
        select 1
        from public.guardians g
        where g.id = guardian_id
          and g.user_id = (select auth.uid())
      )
    )
  );

-- ── committee_members ─────────────────────────────────────────────────────────

drop policy if exists "Parents read own committee_members" on public.committee_members;
create policy "Parents read own committee_members"
  on public.committee_members
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ── parent_activity_notification_reads ────────────────────────────────────────

drop policy if exists "Parents read own activity notification watermarks"
  on public.parent_activity_notification_reads;
create policy "Parents read own activity notification watermarks"
  on public.parent_activity_notification_reads
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and public.user_has_enrolled_parent_access(organization_id)
  );

drop policy if exists "Parents insert own activity notification watermarks"
  on public.parent_activity_notification_reads;
create policy "Parents insert own activity notification watermarks"
  on public.parent_activity_notification_reads
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.user_has_enrolled_parent_access(organization_id)
  );

drop policy if exists "Parents update own activity notification watermarks"
  on public.parent_activity_notification_reads;
create policy "Parents update own activity notification watermarks"
  on public.parent_activity_notification_reads
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and public.user_has_enrolled_parent_access(organization_id)
  )
  with check (
    user_id = (select auth.uid())
    and public.user_has_enrolled_parent_access(organization_id)
  );

-- ── organization_portal_account_link_members ──────────────────────────────────

drop policy if exists "Link group members can read members"
  on public.organization_portal_account_link_members;
create policy "Link group members can read members"
  on public.organization_portal_account_link_members
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.user_is_portal_account_link_member(group_id)
    or public.is_platform_admin()
  );

-- ── Foreign-key indexes ───────────────────────────────────────────────────────

create index if not exists message_thread_participants_staff_member_fk_idx
  on public.message_thread_participants (staff_member_id);
create index if not exists message_thread_participants_guardian_fk_idx
  on public.message_thread_participants (guardian_id);
create index if not exists message_thread_participants_family_fk_idx
  on public.message_thread_participants (family_id);
create index if not exists organization_portal_account_link_members_user_fk_idx
  on public.organization_portal_account_link_members (user_id);
create index if not exists message_threads_program_fk_idx
  on public.message_threads (program_id);
create index if not exists application_payments_payer_user_fk_idx
  on public.application_payments (payer_user_id);
create index if not exists applications_primary_guardian_fk_idx
  on public.applications (primary_guardian_id);

commit;
