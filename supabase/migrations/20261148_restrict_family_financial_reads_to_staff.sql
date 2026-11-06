-- Phase 1b step 2 of docs/parent-portal-audit.md (finding C3): stop parents reading other
-- families' tuition, payment-method and signature data.
--
-- user_is_active_org_member() matches ANY active membership, including role = 'parent', so the
-- "Org members read ..." policies let every parent read every family's rows in their school.
-- They are replaced with staff-only reads (owner / admin / teacher / staff). Parents keep reading
-- their own family through the guardian policies and the peer-aware policies from 20261147.
--
-- Run after: 20261147_parent_portal_narrow_read_policies.sql, and only once step 1 has been
-- smoke-checked (parent billing for a normal parent, a split-billing parent and a linked login).
-- No code deploy is required: parent billing reads these tables with the signed-in user's client
-- and is covered by the guardian / family-portal-member policies.
--
-- Admin writes are unaffected (they use "Org admins manage ..." / "Platform admins manage ...").

drop policy if exists "Org members read tuition_charges" on public.tuition_charges;
drop policy if exists "Staff read tuition_charges" on public.tuition_charges;
create policy "Staff read tuition_charges"
  on public.tuition_charges
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_billing_accounts" on public.tuition_billing_accounts;
drop policy if exists "Staff read tuition_billing_accounts" on public.tuition_billing_accounts;
create policy "Staff read tuition_billing_accounts"
  on public.tuition_billing_accounts
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_billing_splits" on public.tuition_billing_splits;
drop policy if exists "Staff read tuition_billing_splits" on public.tuition_billing_splits;
create policy "Staff read tuition_billing_splits"
  on public.tuition_billing_splits
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_adjustments" on public.tuition_adjustments;
drop policy if exists "Staff read tuition_adjustments" on public.tuition_adjustments;
create policy "Staff read tuition_adjustments"
  on public.tuition_adjustments
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read tuition_enrollment_assignments" on public.tuition_enrollment_assignments;
drop policy if exists "Staff read tuition_enrollment_assignments" on public.tuition_enrollment_assignments;
create policy "Staff read tuition_enrollment_assignments"
  on public.tuition_enrollment_assignments
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

drop policy if exists "Org members read family_payment_methods" on public.family_payment_methods;
drop policy if exists "Staff read family_payment_methods" on public.family_payment_methods;
create policy "Staff read family_payment_methods"
  on public.family_payment_methods
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));

-- document_signatures: no parent-facing user-client reads exist in the app (signature_data and
-- ip_address were readable by every parent in the school).
drop policy if exists "Org members can read document_signatures" on public.document_signatures;
drop policy if exists "Staff read document_signatures" on public.document_signatures;
create policy "Staff read document_signatures"
  on public.document_signatures
  for select
  to authenticated
  using (public.user_is_staff_org_member(organization_id));
