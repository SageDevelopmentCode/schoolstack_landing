-- Promoted to supabase/migrations/20261153_staff_only_organization_membership_reads.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08 — organization_memberships staff-only SELECT (docs/parent-portal-audit.md).
--
-- PREREQUISITE: 20261147 (own-row policy) is applied. No app deploy is required.
-- RLS tightening shows up as empty data, not errors. Dry-run first.
--
-- HOW TO RUN SAFELY
--   1. Dry run (bottom): a parent sees only their own rows, a teacher sees the school.
--   2. Run between the "=== MIGRATION ===" markers.
--   3. Smoke-check: parent login and school picker (web and mobile), admin membership list,
--      teacher app school list. Roll back if a list that should be full is empty.
--
-- === MIGRATION START ===

-- Phase 1b step 3 remainder: organization_memberships (docs/parent-portal-audit.md, finding C3).
--
-- "Org members can read memberships in their org" lets any parent read every member's
-- user id and role in the school. The own-row policy from 20261147 already lets a user
-- and their linked-account peers read their own rows. School-admin and notification
-- code that lists every member uses the service role. Mobile school picker, portal
-- routing, and login destination filter to the caller's own user ids. Platform admins
-- keep "Platform admins manage memberships". Insert/update/delete stay org-admin only.
--
-- Run after: 20261151_staff_only_reads_phase1b_step3.sql
-- No code deploy is required.

drop policy if exists "Org members can read memberships in their org"
  on public.organization_memberships;
drop policy if exists "Staff read organization_memberships"
  on public.organization_memberships;
create policy "Staff read organization_memberships"
  on public.organization_memberships
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

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
--   do $$ declare n int; own int; begin
--     select count(*) into n from public.organization_memberships where organization_id = (select v::uuid from _dry where k='org');
--     select count(*) into own from public.organization_memberships
--      where organization_id = (select v::uuid from _dry where k='org')
--        and user_id = (select v::uuid from _dry where k='parent_user');
--     raise notice 'parent memberships visible=% own=% (visible should be own plus linked peers, not the whole school)', n, own;
--   end $$;
--   reset role;
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='teacher_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.organization_memberships where organization_id = (select v::uuid from _dry where k='org');
--     raise notice 'teacher memberships visible=% (expect every member in the school)', n;
--   end $$;
--   reset role;
-- rollback;

-- ===========================================================================
-- ROLLBACK
-- ===========================================================================
--
-- begin;
--   drop policy if exists "Staff read organization_memberships" on public.organization_memberships;
--   create policy "Org members can read memberships in their org"
--     on public.organization_memberships
--     for select to authenticated
--     using (public.user_is_active_org_member(organization_id));
-- commit;
