-- Promoted to supabase/migrations/20261147_parent_portal_narrow_read_policies.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-06 — Phase 1b step 1 (docs/parent-portal-audit.md): ADDITIVE narrow read policies.
--
-- Nothing is dropped or tightened, so this is safe to run at any time and needs no code deploy.
-- Run the next file (restrict_family_financial_reads_to_staff_2026_11_06.sql) only after you
-- have smoke-checked this one.
--
-- HOW TO RUN SAFELY
--   1. (Optional) DRY RUN block at the bottom: applies this file in a transaction, then SIMULATES
--      step 2 (drops the broad policies inside the transaction) and prints what a parent,
--      a linked login and an unrelated parent can read. Always rolls back.
--   2. Run everything between the "=== MIGRATION ===" markers once, as one script.
--   3. Smoke-check parent home, billing, children and enrollment on rooted-meadows-demo.
--   4. Rollback block is at the very bottom (commented).
--
-- === MIGRATION START ===

-- Phase 1b step 1 of docs/parent-portal-audit.md: add narrow, family-scoped read access.
--
-- ADDITIVE ONLY: nothing is dropped or tightened here, so every existing read keeps working.
-- These policies exist so that step 2 (20261148) can remove the broad
-- "Org members read ..." policies without breaking parents, including parents who use a
-- linked portal account (organization_portal_account_links).
--
-- Why a new helper: user_is_guardian_for_family() only checks guardians.user_id = auth.uid(),
-- so a linked-account login (no guardian row of its own) only sees family billing today because
-- of the broad org-member policy. user_is_family_portal_member() includes linked peers.
--
-- Run after: 20261146_lock_down_open_policies_and_function_grants.sql
-- Note: since 20261146, new functions are locked by default, so grants below are explicit.

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so policies do not recurse into guardians/enrollments RLS)
-- ---------------------------------------------------------------------------

create or replace function public.user_is_family_portal_member(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guardians g
    where g.family_id = p_family_id
      and g.user_id in (select public.portal_account_link_peer_user_ids(g.organization_id))
  );
$$;

-- True when the caller (or a linked login) has a child enrolled in, or an application for,
-- the program. Used so parents can read only their own programs.
create or replace function public.user_has_program_portal_link(p_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.enrollments e
      join public.students s on s.id = e.student_id
      where e.program_id = p_program_id
        and s.family_id is not null
        and public.user_is_family_portal_member(s.family_id)
    )
    or exists (
      select 1
      from public.applications a
      where a.program_id = p_program_id
        and (
          (a.family_id is not null and public.user_is_family_portal_member(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    );
$$;

-- True when the caller (or a linked login) owns an application that used this form version.
-- Covers archived versions that the "published only" policy no longer shows.
create or replace function public.user_has_application_for_form_version(p_form_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications a
    where a.form_version_id = p_form_version_id
      and (
        (a.family_id is not null and public.user_is_family_portal_member(a.family_id))
        or a.created_by_user_id = auth.uid()
      )
  );
$$;

-- True when the caller is a guardian of an enrollment that uses this checklist template.
create or replace function public.user_has_checklist_for_template(p_template_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollment_checklists ec
    where ec.template_id = p_template_id
      and public.user_is_guardian_for_enrollment(ec.enrollment_id)
  );
$$;

revoke all on function public.user_is_family_portal_member(uuid) from public, anon;
grant execute on function public.user_is_family_portal_member(uuid) to authenticated, service_role;

revoke all on function public.user_has_program_portal_link(uuid) from public, anon;
grant execute on function public.user_has_program_portal_link(uuid) to authenticated, service_role;

revoke all on function public.user_has_application_for_form_version(uuid) from public, anon;
grant execute on function public.user_has_application_for_form_version(uuid) to authenticated, service_role;

revoke all on function public.user_has_checklist_for_template(uuid) from public, anon;
grant execute on function public.user_has_checklist_for_template(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Family financial tables: guardians (including linked logins) read their own family only.
-- Existing guardian policies stay; these add the linked-login case.
-- ---------------------------------------------------------------------------

drop policy if exists "Family portal members read own tuition_billing_accounts"
  on public.tuition_billing_accounts;
create policy "Family portal members read own tuition_billing_accounts"
  on public.tuition_billing_accounts
  for select
  to authenticated
  using (public.user_is_family_portal_member(family_id));

drop policy if exists "Family portal members read own tuition_billing_splits"
  on public.tuition_billing_splits;
create policy "Family portal members read own tuition_billing_splits"
  on public.tuition_billing_splits
  for select
  to authenticated
  using (public.user_is_family_portal_member(family_id));

drop policy if exists "Family portal members read own tuition_enrollment_assignments"
  on public.tuition_enrollment_assignments;
create policy "Family portal members read own tuition_enrollment_assignments"
  on public.tuition_enrollment_assignments
  for select
  to authenticated
  using (public.user_is_family_portal_member(family_id));

drop policy if exists "Family portal members read own tuition_adjustments"
  on public.tuition_adjustments;
create policy "Family portal members read own tuition_adjustments"
  on public.tuition_adjustments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tuition_enrollment_assignments a
      where a.id = tuition_adjustments.assignment_id
        and public.user_is_family_portal_member(a.family_id)
    )
  );

drop policy if exists "Family portal members read own family_payment_methods"
  on public.family_payment_methods;
create policy "Family portal members read own family_payment_methods"
  on public.family_payment_methods
  for select
  to authenticated
  using (public.user_is_family_portal_member(family_id));

-- Same rule as "Guardians read own tuition_charges": charges tied to a specific guardian
-- (split billing) are visible only to that guardian's login(s).
drop policy if exists "Family portal members read own tuition_charges"
  on public.tuition_charges;
create policy "Family portal members read own tuition_charges"
  on public.tuition_charges
  for select
  to authenticated
  using (
    public.user_is_family_portal_member(family_id)
    and (
      guardian_id is null
      or exists (
        select 1
        from public.guardians g
        where g.id = tuition_charges.guardian_id
          and g.user_id in (select public.portal_account_link_peer_user_ids(g.organization_id))
      )
    )
  );

-- ---------------------------------------------------------------------------
-- Narrow reads that replace broad org-member reads in later steps (1b step 3)
-- ---------------------------------------------------------------------------

-- userHasParentAccess reads the caller's own membership row. Includes linked logins.
drop policy if exists "Users read own organization_memberships"
  on public.organization_memberships;
create policy "Users read own organization_memberships"
  on public.organization_memberships
  for select
  to authenticated
  using (user_id in (select public.portal_account_link_peer_user_ids(organization_id)));

drop policy if exists "Guardians read own programs" on public.programs;
create policy "Guardians read own programs"
  on public.programs
  for select
  to authenticated
  using (public.user_has_program_portal_link(id));

drop policy if exists "Guardians read form versions of own applications"
  on public.application_form_versions;
create policy "Guardians read form versions of own applications"
  on public.application_form_versions
  for select
  to authenticated
  using (public.user_has_application_for_form_version(id));

drop policy if exists "Guardians read own enrollment_checklist_templates"
  on public.enrollment_checklist_templates;
create policy "Guardians read own enrollment_checklist_templates"
  on public.enrollment_checklist_templates
  for select
  to authenticated
  using (public.user_has_checklist_for_template(id));

drop policy if exists "Guardians read own enrollment_checklist_template_items"
  on public.enrollment_checklist_template_items;
create policy "Guardians read own enrollment_checklist_template_items"
  on public.enrollment_checklist_template_items
  for select
  to authenticated
  using (public.user_has_checklist_for_template(template_id));

-- === MIGRATION END ===

-- ===========================================================================
-- DRY RUN (copy this whole block; it never commits)
-- ===========================================================================
--
-- begin;
--
--   -- >>> paste the MIGRATION body here <<<
--
--   -- Simulate step 2 (this is what 20261148 does) so the new policies are what grants access.
--   drop policy if exists "Org members read tuition_charges" on public.tuition_charges;
--   drop policy if exists "Org members read tuition_billing_accounts" on public.tuition_billing_accounts;
--   drop policy if exists "Org members read tuition_billing_splits" on public.tuition_billing_splits;
--   drop policy if exists "Org members read tuition_adjustments" on public.tuition_adjustments;
--   drop policy if exists "Org members read tuition_enrollment_assignments" on public.tuition_enrollment_assignments;
--   drop policy if exists "Org members read family_payment_methods" on public.family_payment_methods;
--
--   create temp table _dry (k text primary key, v text) on commit drop;
--   grant all on _dry to public;
--
--   -- Pick a family with charges in the demo school and its parent login.
--   insert into _dry
--   select 'org', o.id::text from public.organizations o where o.slug = 'rooted-meadows-demo';
--
--   insert into _dry
--   select 'family_a', c.family_id::text
--   from public.tuition_charges c
--   join public.guardians g on g.family_id = c.family_id and g.user_id is not null
--   where c.organization_id = (select v::uuid from _dry where k = 'org')
--   limit 1;
--
--   insert into _dry
--   select 'parent_a', g.user_id::text
--   from public.guardians g
--   where g.family_id = (select v::uuid from _dry where k = 'family_a') and g.user_id is not null
--   limit 1;
--
--   -- A different family with a login = "unrelated parent".
--   insert into _dry
--   select 'parent_b', g.user_id::text
--   from public.guardians g
--   where g.organization_id = (select v::uuid from _dry where k = 'org')
--     and g.family_id <> (select v::uuid from _dry where k = 'family_a')
--     and g.user_id is not null
--     and g.user_id::text <> (select v from _dry where k = 'parent_a')
--   limit 1;
--
--   -- A linked login (no guardian row of its own) and the family of the login it is linked to.
--   insert into _dry
--   select 'peer_user', m.user_id::text
--   from public.organization_portal_account_link_members m
--   where m.organization_id = (select v::uuid from _dry where k = 'org')
--     and not exists (
--       select 1 from public.guardians g
--       where g.user_id = m.user_id and g.organization_id = m.organization_id
--     )
--   limit 1;
--
--   insert into _dry
--   select 'peer_family', g.family_id::text
--   from public.organization_portal_account_link_members m1
--   join public.organization_portal_account_link_members m2
--     on m2.group_id = m1.group_id and m2.user_id <> m1.user_id
--   join public.guardians g on g.user_id = m2.user_id and g.organization_id = m1.organization_id
--   where m1.user_id::text = (select v from _dry where k = 'peer_user')
--   limit 1;
--
--   select * from _dry;  -- sanity: expect org, family_a, parent_a, parent_b, peer_user, peer_family
--
--   -- Parent A: sees own family's rows, nothing for other families.
--   select set_config('request.jwt.claims',
--     json_build_object('sub', (select v from _dry where k = 'parent_a'), 'role', 'authenticated')::text, true);
--   set local role authenticated;
--
--   do $$
--   declare
--     fam_a uuid := (select v::uuid from _dry where k = 'family_a');
--     own int; other int;
--   begin
--     select count(*) into own from public.tuition_charges where family_id = fam_a;
--     select count(*) into other from public.tuition_charges where family_id <> fam_a;
--     raise notice 'parent_a charges: own=% (expect >0), other=% (expect 0)', own, other;
--     select count(*) into other from public.tuition_billing_accounts where family_id <> fam_a;
--     raise notice 'parent_a billing_accounts other=% (expect 0)', other;
--     select count(*) into other from public.family_payment_methods where family_id <> fam_a;
--     raise notice 'parent_a payment_methods other=% (expect 0)', other;
--     select count(*) into own from public.organization_memberships;
--     raise notice 'parent_a organization_memberships visible=% (expect own rows only, usually 1)', own;
--     select count(*) into own from public.programs;
--     raise notice 'parent_a programs visible=% (own programs only)', own;
--   end $$;
--
--   reset role;
--
--   -- Unrelated parent B: nothing from family A.
--   select set_config('request.jwt.claims',
--     json_build_object('sub', (select v from _dry where k = 'parent_b'), 'role', 'authenticated')::text, true);
--   set local role authenticated;
--
--   do $$
--   declare fam_a uuid := (select v::uuid from _dry where k = 'family_a'); n int;
--   begin
--     select count(*) into n from public.tuition_charges where family_id = fam_a;
--     raise notice 'parent_b sees family_a charges=% (expect 0)', n;
--     select count(*) into n from public.family_payment_methods where family_id = fam_a;
--     raise notice 'parent_b sees family_a payment_methods=% (expect 0)', n;
--   end $$;
--
--   reset role;
--
--   -- Linked login: sees the linked family's billing through the new peer-aware policies.
--   select set_config('request.jwt.claims',
--     json_build_object('sub', (select v from _dry where k = 'peer_user'), 'role', 'authenticated')::text, true);
--   set local role authenticated;
--
--   do $$
--   declare fam uuid := (select v::uuid from _dry where k = 'peer_family'); n int; o int;
--   begin
--     select count(*) into n from public.tuition_charges where family_id = fam;
--     select count(*) into o from public.tuition_charges where family_id <> fam;
--     raise notice 'peer_user linked-family charges=% (expect >0 if that family has charges), other=% (expect 0)', n, o;
--     select count(*) into n from public.tuition_enrollment_assignments where family_id = fam;
--     raise notice 'peer_user linked-family assignments=%', n;
--   end $$;
--
--   reset role;
--
-- rollback;  -- never commit the dry run

-- ===========================================================================
-- ROLLBACK (only if needed; removes only what this file added)
-- ===========================================================================
--
-- begin;
--   drop policy if exists "Family portal members read own tuition_billing_accounts" on public.tuition_billing_accounts;
--   drop policy if exists "Family portal members read own tuition_billing_splits" on public.tuition_billing_splits;
--   drop policy if exists "Family portal members read own tuition_enrollment_assignments" on public.tuition_enrollment_assignments;
--   drop policy if exists "Family portal members read own tuition_adjustments" on public.tuition_adjustments;
--   drop policy if exists "Family portal members read own family_payment_methods" on public.family_payment_methods;
--   drop policy if exists "Family portal members read own tuition_charges" on public.tuition_charges;
--   drop policy if exists "Users read own organization_memberships" on public.organization_memberships;
--   drop policy if exists "Guardians read own programs" on public.programs;
--   drop policy if exists "Guardians read form versions of own applications" on public.application_form_versions;
--   drop policy if exists "Guardians read own enrollment_checklist_templates" on public.enrollment_checklist_templates;
--   drop policy if exists "Guardians read own enrollment_checklist_template_items" on public.enrollment_checklist_template_items;
--   drop function if exists public.user_has_checklist_for_template(uuid);
--   drop function if exists public.user_has_application_for_form_version(uuid);
--   drop function if exists public.user_has_program_portal_link(uuid);
--   drop function if exists public.user_is_family_portal_member(uuid);
-- commit;
