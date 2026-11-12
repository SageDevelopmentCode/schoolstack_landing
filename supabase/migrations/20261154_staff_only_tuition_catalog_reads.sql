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
