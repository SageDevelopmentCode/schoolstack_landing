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
