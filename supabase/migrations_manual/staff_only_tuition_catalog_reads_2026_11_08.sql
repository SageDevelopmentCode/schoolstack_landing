-- Promoted to supabase/migrations/20261154_staff_only_tuition_catalog_reads.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08 — tuition catalog staff-only SELECT (docs/parent-portal-audit.md).
--
-- DEPLOY THE APP CODE FIRST. Parent billing loads catalogs with the service role after
-- the access check. Pasting this before that deploy makes plan labels empty.
--
-- HOW TO RUN SAFELY
--   1. Dry run (bottom).
--   2. Run between the "=== MIGRATION ===" markers.
--   3. Smoke-check parent billing (a family with a plan, and one choosing a payment plan)
--      and the school admin tuition catalog. Roll back if either is empty.
--
-- === MIGRATION START ===

-- Phase 1b step 3 remainder: tuition catalogs (docs/parent-portal-audit.md).
--
-- Parents no longer read these tables with their own session. Parent billing loads the
-- family's rate plans, tiers, payment plans, and fee components with the service role
-- after the parent-portal access check (loadParentBillingInitialDataWithClient).
-- School admin editors keep reading them through user_is_staff_org_member (teachers
-- included). programs stays on the broad member policy.
--
-- DEPLOY THE APP CODE FIRST. Pasting this before that deploy makes parent billing
-- plan labels empty (RLS returns no rows, not an error).
--
-- Run after: 20261153_staff_only_organization_membership_reads.sql

drop policy if exists "Org members read tuition_rate_plans" on public.tuition_rate_plans;
drop policy if exists "Staff read tuition_rate_plans" on public.tuition_rate_plans;
create policy "Staff read tuition_rate_plans"
  on public.tuition_rate_plans
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_rate_tiers" on public.tuition_rate_tiers;
drop policy if exists "Staff read tuition_rate_tiers" on public.tuition_rate_tiers;
create policy "Staff read tuition_rate_tiers"
  on public.tuition_rate_tiers
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_payment_plans" on public.tuition_payment_plans;
drop policy if exists "Staff read tuition_payment_plans" on public.tuition_payment_plans;
create policy "Staff read tuition_payment_plans"
  on public.tuition_payment_plans
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_fee_components" on public.tuition_fee_components;
drop policy if exists "Staff read tuition_fee_components" on public.tuition_fee_components;
create policy "Staff read tuition_fee_components"
  on public.tuition_fee_components
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
--   do $$ declare n int; begin
--     select count(*) into n from public.tuition_rate_plans; raise notice 'parent tuition_rate_plans=% (expect 0)', n;
--     select count(*) into n from public.tuition_rate_tiers; raise notice 'parent tuition_rate_tiers=% (expect 0)', n;
--     select count(*) into n from public.tuition_payment_plans; raise notice 'parent tuition_payment_plans=% (expect 0)', n;
--     select count(*) into n from public.tuition_fee_components; raise notice 'parent tuition_fee_components=% (expect 0)', n;
--   end $$;
--   reset role;
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='teacher_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.tuition_rate_plans; raise notice 'teacher tuition_rate_plans=% (expect the school catalog)', n;
--   end $$;
--   reset role;
-- rollback;

-- ===========================================================================
-- ROLLBACK
-- ===========================================================================
--
-- begin;
--   drop policy if exists "Staff read tuition_rate_plans" on public.tuition_rate_plans;
--   create policy "Org members read tuition_rate_plans" on public.tuition_rate_plans
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read tuition_rate_tiers" on public.tuition_rate_tiers;
--   create policy "Org members read tuition_rate_tiers" on public.tuition_rate_tiers
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read tuition_payment_plans" on public.tuition_payment_plans;
--   create policy "Org members read tuition_payment_plans" on public.tuition_payment_plans
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   drop policy if exists "Staff read tuition_fee_components" on public.tuition_fee_components;
--   create policy "Org members read tuition_fee_components" on public.tuition_fee_components
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
-- commit;
