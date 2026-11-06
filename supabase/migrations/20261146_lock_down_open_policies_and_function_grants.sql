-- Phase 1a of docs/parent-portal-audit.md: database emergency.
--
-- 1. Remove the "Allow all access" (FOR ALL USING true) policies that let the
--    public API key write to organizations (97 ON DELETE CASCADE foreign keys),
--    organization_progress_log and organization_timeline_phase_demos.
-- 2. Revoke execute on service-role-only SECURITY DEFINER functions. Earlier
--    migrations revoked from public/authenticated but never from anon, which
--    Supabase grants explicitly by default.
-- 3. Put caller checks in front of page-summary functions that the app calls
--    with the signed-in user's own client (original body is kept unchanged as
--    <name>_unchecked, locked to the owner).
-- 4. Make future functions start locked (default privileges).
--
-- Run after: 20261145_restrict_staff_work_time_entries_authenticated_writes.sql
-- Safe to run before any code deploy: every app caller of the service-only
-- functions uses createAdminClient(); user-client callers keep working through
-- the guarded wrappers.

-- ---------------------------------------------------------------------------
-- 1. Open write policies
-- ---------------------------------------------------------------------------

drop policy if exists "Allow all access" on public.organizations;

-- Defense in depth: the public (anon) key never writes organizations.
revoke insert, update, delete on public.organizations from anon;

-- These two tables only exist on remote / bootstrap databases, so guard them.
do $$
begin
  if to_regclass('public.organization_progress_log') is not null then
    drop policy if exists "Allow all access" on public.organization_progress_log;

    drop policy if exists "Public read published organization_progress_log"
      on public.organization_progress_log;
    create policy "Public read published organization_progress_log"
      on public.organization_progress_log
      for select
      to anon, authenticated
      using (published = true);

    drop policy if exists "Platform admins manage organization_progress_log"
      on public.organization_progress_log;
    create policy "Platform admins manage organization_progress_log"
      on public.organization_progress_log
      for all
      to authenticated
      using (public.is_platform_admin())
      with check (public.is_platform_admin());

    revoke insert, update, delete on public.organization_progress_log from anon;
  end if;

  if to_regclass('public.organization_timeline_phase_demos') is not null then
    drop policy if exists "Allow all access" on public.organization_timeline_phase_demos;

    drop policy if exists "Public read published organization_timeline_phase_demos"
      on public.organization_timeline_phase_demos;
    create policy "Public read published organization_timeline_phase_demos"
      on public.organization_timeline_phase_demos
      for select
      to anon, authenticated
      using (published = true);

    drop policy if exists "Platform admins manage organization_timeline_phase_demos"
      on public.organization_timeline_phase_demos;
    create policy "Platform admins manage organization_timeline_phase_demos"
      on public.organization_timeline_phase_demos
      for all
      to authenticated
      using (public.is_platform_admin())
      with check (public.is_platform_admin());

    revoke insert, update, delete on public.organization_timeline_phase_demos from anon;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Service-role-only functions (every app caller uses createAdminClient())
-- ---------------------------------------------------------------------------

revoke all on function public.waive_tuition_charge_atomic(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.waive_tuition_charge_atomic(uuid, uuid)
  to service_role;

revoke all on function public.revert_tuition_ach_settlement_atomic(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.revert_tuition_ach_settlement_atomic(uuid, text, text)
  to service_role;

revoke all on function public.sign_teacher_parent_form_response_atomic(uuid, uuid, uuid, jsonb, timestamptz)
  from public, anon, authenticated;
grant execute on function public.sign_teacher_parent_form_response_atomic(uuid, uuid, uuid, jsonb, timestamptz)
  to service_role;

revoke all on function public.enroll_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.enroll_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  to service_role;

revoke all on function public.withdraw_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.withdraw_friday_branch_student_atomic(uuid, uuid, uuid, uuid, text)
  to service_role;

revoke all on function public.save_friday_branch_schedule(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_friday_branch_schedule(uuid, jsonb)
  to service_role;

revoke all on function public.append_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.append_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  to service_role;

revoke all on function public.remove_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.remove_program_coop_supply_assigned_family(uuid, uuid, uuid, uuid)
  to service_role;

revoke all on function public.append_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.append_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid, boolean)
  to service_role;

revoke all on function public.remove_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function public.remove_program_coop_teaching_schedule_parent(uuid, uuid, uuid, text, uuid)
  to service_role;

revoke all on function public.latest_messages_for_threads(uuid[])
  from public, anon, authenticated;
grant execute on function public.latest_messages_for_threads(uuid[])
  to service_role;

revoke all on function public.thread_unread_counts(uuid, uuid[])
  from public, anon, authenticated;
grant execute on function public.thread_unread_counts(uuid, uuid[])
  to service_role;

revoke all on function public.count_admin_unread_messages(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.count_admin_unread_messages(uuid, uuid)
  to service_role;

-- ---------------------------------------------------------------------------
-- 3. Guarded wrappers for page-summary functions called with the user's client
--
-- Pattern: rename the original to <name>_unchecked (body untouched, no drift),
-- lock it, then create a wrapper with the original name + signature that
-- checks the caller and delegates. Re-running this file is safe.
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regprocedure('public.admin_dashboard_metrics_unchecked(uuid,uuid)') is null then
    alter function public.admin_dashboard_metrics(uuid, uuid)
      rename to admin_dashboard_metrics_unchecked;
  end if;
  if to_regprocedure('public.admin_schedule_page_meta_unchecked(uuid,integer,integer)') is null then
    alter function public.admin_schedule_page_meta(uuid, integer, integer)
      rename to admin_schedule_page_meta_unchecked;
  end if;
  if to_regprocedure('public.admin_students_page_meta_unchecked(uuid)') is null then
    alter function public.admin_students_page_meta(uuid)
      rename to admin_students_page_meta_unchecked;
  end if;
  if to_regprocedure('public.admin_submissions_page_meta_unchecked(uuid)') is null then
    alter function public.admin_submissions_page_meta(uuid)
      rename to admin_submissions_page_meta_unchecked;
  end if;
  if to_regprocedure('public.admin_tuition_page_meta_unchecked(uuid,text,date,date)') is null then
    alter function public.admin_tuition_page_meta(uuid, text, date, date)
      rename to admin_tuition_page_meta_unchecked;
  end if;
  if to_regprocedure('public.parent_billing_page_meta_unchecked(uuid,uuid)') is null then
    alter function public.parent_billing_page_meta(uuid, uuid)
      rename to parent_billing_page_meta_unchecked;
  end if;
  if to_regprocedure('public.parent_portal_home_meta_unchecked(uuid,uuid)') is null then
    alter function public.parent_portal_home_meta(uuid, uuid)
      rename to parent_portal_home_meta_unchecked;
  end if;
end $$;

revoke all on function public.admin_dashboard_metrics_unchecked(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.admin_schedule_page_meta_unchecked(uuid, integer, integer)
  from public, anon, authenticated;
revoke all on function public.admin_students_page_meta_unchecked(uuid)
  from public, anon, authenticated;
revoke all on function public.admin_submissions_page_meta_unchecked(uuid)
  from public, anon, authenticated;
revoke all on function public.admin_tuition_page_meta_unchecked(uuid, text, date, date)
  from public, anon, authenticated;
revoke all on function public.parent_billing_page_meta_unchecked(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.parent_portal_home_meta_unchecked(uuid, uuid)
  from public, anon, authenticated;

-- Admin-side summaries: service role, platform admin, or staff of the org.
-- (get_organization_payment_transactions_meta is intentionally absent: already guarded.)
create or replace function public.admin_dashboard_metrics(
  p_organization_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    coalesce(auth.role() = 'service_role', false)
    or public.is_platform_admin()
    or public.user_is_staff_org_member(p_organization_id)
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return public.admin_dashboard_metrics_unchecked(p_organization_id, p_user_id);
end;
$$;

create or replace function public.admin_schedule_page_meta(
  p_organization_id uuid,
  p_year integer,
  p_month integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    coalesce(auth.role() = 'service_role', false)
    or public.is_platform_admin()
    or public.user_is_staff_org_member(p_organization_id)
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return public.admin_schedule_page_meta_unchecked(p_organization_id, p_year, p_month);
end;
$$;

create or replace function public.admin_students_page_meta(p_organization_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    coalesce(auth.role() = 'service_role', false)
    or public.is_platform_admin()
    or public.user_is_staff_org_member(p_organization_id)
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return public.admin_students_page_meta_unchecked(p_organization_id);
end;
$$;

create or replace function public.admin_submissions_page_meta(p_organization_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    coalesce(auth.role() = 'service_role', false)
    or public.is_platform_admin()
    or public.user_is_staff_org_member(p_organization_id)
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return public.admin_submissions_page_meta_unchecked(p_organization_id);
end;
$$;

create or replace function public.admin_tuition_page_meta(
  p_organization_id uuid,
  p_outstanding_period text default 'current_month',
  p_school_year_start date default null,
  p_school_year_end date default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    coalesce(auth.role() = 'service_role', false)
    or public.is_platform_admin()
    or public.user_is_staff_org_member(p_organization_id)
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return public.admin_tuition_page_meta_unchecked(
    p_organization_id,
    p_outstanding_period,
    p_school_year_start,
    p_school_year_end
  );
end;
$$;

-- Parent-side summaries: service role, platform admin (family preview), staff,
-- or a guardian of the family. Guardian check includes linked-account peers,
-- matching how the app resolves family ids (portal_account_link_peer_user_ids).
create or replace function public.parent_billing_page_meta(
  p_organization_id uuid,
  p_family_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    coalesce(auth.role() = 'service_role', false)
    or public.is_platform_admin()
    or public.user_is_staff_org_member(p_organization_id)
    or exists (
      select 1
      from public.guardians g
      where g.family_id = p_family_id
        and g.organization_id = p_organization_id
        and g.user_id in (
          select public.portal_account_link_peer_user_ids(p_organization_id)
        )
    )
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return public.parent_billing_page_meta_unchecked(p_organization_id, p_family_id);
end;
$$;

create or replace function public.parent_portal_home_meta(
  p_organization_id uuid,
  p_family_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (
    coalesce(auth.role() = 'service_role', false)
    or public.is_platform_admin()
    or public.user_is_staff_org_member(p_organization_id)
    or exists (
      select 1
      from public.guardians g
      where g.family_id = p_family_id
        and g.organization_id = p_organization_id
        and g.user_id in (
          select public.portal_account_link_peer_user_ids(p_organization_id)
        )
    )
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return public.parent_portal_home_meta_unchecked(p_organization_id, p_family_id);
end;
$$;

-- Wrappers: authenticated users + service role only (never anon / public).
revoke all on function public.admin_dashboard_metrics(uuid, uuid) from public, anon;
grant execute on function public.admin_dashboard_metrics(uuid, uuid) to authenticated, service_role;

revoke all on function public.admin_schedule_page_meta(uuid, integer, integer) from public, anon;
grant execute on function public.admin_schedule_page_meta(uuid, integer, integer) to authenticated, service_role;

revoke all on function public.admin_students_page_meta(uuid) from public, anon;
grant execute on function public.admin_students_page_meta(uuid) to authenticated, service_role;

revoke all on function public.admin_submissions_page_meta(uuid) from public, anon;
grant execute on function public.admin_submissions_page_meta(uuid) to authenticated, service_role;

revoke all on function public.admin_tuition_page_meta(uuid, text, date, date) from public, anon;
grant execute on function public.admin_tuition_page_meta(uuid, text, date, date) to authenticated, service_role;

-- get_organization_payment_transactions_meta already enforces platform admin / org admin
-- internally (20260927). No wrapper needed; just stop exposing it to anon.
revoke all on function public.get_organization_payment_transactions_meta(uuid) from public, anon;
grant execute on function public.get_organization_payment_transactions_meta(uuid) to authenticated, service_role;

revoke all on function public.parent_billing_page_meta(uuid, uuid) from public, anon;
grant execute on function public.parent_billing_page_meta(uuid, uuid) to authenticated, service_role;

revoke all on function public.parent_portal_home_meta(uuid, uuid) from public, anon;
grant execute on function public.parent_portal_home_meta(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. Future functions start locked
--
-- New functions created by postgres no longer get execute for public / anon /
-- authenticated. RLS helper functions and any function that a signed-in client
-- must call now need an explicit `grant execute ... to authenticated` (and to
-- anon if used in a public-read policy). See
-- .agents/skills/supabase-migrations/SKILL.md ("Function grants").
-- ---------------------------------------------------------------------------

alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;
