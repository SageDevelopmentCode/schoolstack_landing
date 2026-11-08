-- Promoted to supabase/migrations/20261148_restrict_family_financial_reads_to_staff.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-06 — Phase 1b step 2 (docs/parent-portal-audit.md, finding C3).
--
-- PREREQUISITE: parent_portal_narrow_read_policies_2026_11_06.sql (step 1) applied AND smoke-checked.
-- This file REMOVES the broad "Org members read ..." policies, so it is the one that can make a
-- page show empty data if step 1 missed a case. Use the dry run first, then the rollback if needed.
--
-- HOW TO RUN SAFELY
--   1. Dry run (bottom of file): shows what parent / linked login / unrelated parent / admin /
--      teacher can read after the change. Always rolls back.
--   2. Run between the "=== MIGRATION ===" markers.
--   3. Smoke-check (rooted-meadows-demo first, then rooted-meadows):
--        parent billing (own charges, pay, autopay), parent billing with a split, linked login billing,
--        parent home + children, admin tuition dashboard, finances/transactions, teacher portal.
--   4. If anything is empty that should not be, run the ROLLBACK block immediately.
--
-- === MIGRATION START ===

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
--   select 'family_a', c.family_id::text
--   from public.tuition_charges c
--   join public.guardians g on g.family_id = c.family_id and g.user_id is not null
--   where c.organization_id = (select v::uuid from _dry where k = 'org')
--   limit 1;
--
--   insert into _dry
--   select 'parent_a', g.user_id::text from public.guardians g
--   where g.family_id = (select v::uuid from _dry where k = 'family_a') and g.user_id is not null limit 1;
--
--   insert into _dry
--   select 'parent_b', g.user_id::text from public.guardians g
--   where g.organization_id = (select v::uuid from _dry where k = 'org')
--     and g.family_id <> (select v::uuid from _dry where k = 'family_a')
--     and g.user_id is not null
--     and g.user_id::text <> (select v from _dry where k = 'parent_a')
--   limit 1;
--
--   insert into _dry
--   select 'peer_user', m.user_id::text from public.organization_portal_account_link_members m
--   where m.organization_id = (select v::uuid from _dry where k = 'org')
--     and not exists (select 1 from public.guardians g where g.user_id = m.user_id and g.organization_id = m.organization_id)
--   limit 1;
--
--   insert into _dry
--   select 'peer_family', g.family_id::text
--   from public.organization_portal_account_link_members m1
--   join public.organization_portal_account_link_members m2 on m2.group_id = m1.group_id and m2.user_id <> m1.user_id
--   join public.guardians g on g.user_id = m2.user_id and g.organization_id = m1.organization_id
--   where m1.user_id::text = (select v from _dry where k = 'peer_user') limit 1;
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
--   -- Parent A: own family only
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='parent_a'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$
--   declare fam uuid := (select v::uuid from _dry where k='family_a'); own int; other int;
--   begin
--     select count(*) into own from public.tuition_charges where family_id = fam;
--     select count(*) into other from public.tuition_charges where family_id <> fam;
--     raise notice 'parent_a charges own=% (expect >0) other=% (expect 0)', own, other;
--     select count(*) into own from public.tuition_enrollment_assignments where family_id = fam;
--     select count(*) into other from public.tuition_enrollment_assignments where family_id <> fam;
--     raise notice 'parent_a assignments own=% other=% (expect 0)', own, other;
--     select count(*) into own from public.tuition_billing_accounts where family_id = fam;
--     select count(*) into other from public.tuition_billing_accounts where family_id <> fam;
--     raise notice 'parent_a billing_accounts own=% other=% (expect 0)', own, other;
--     select count(*) into other from public.family_payment_methods where family_id <> fam;
--     raise notice 'parent_a payment_methods other=% (expect 0)', other;
--     select count(*) into other from public.document_signatures;
--     raise notice 'parent_a document_signatures visible=% (expect 0)', other;
--     perform public.parent_billing_page_meta((select v::uuid from _dry where k='org'), fam);
--     raise notice 'OK parent_a parent_billing_page_meta';
--   end $$;
--   reset role;
--
--   -- Unrelated parent B: nothing from family A
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='parent_b'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$
--   declare fam uuid := (select v::uuid from _dry where k='family_a'); n int;
--   begin
--     select count(*) into n from public.tuition_charges where family_id = fam;
--     raise notice 'parent_b sees family_a charges=% (expect 0)', n;
--   end $$;
--   reset role;
--
--   -- Linked login: still sees the linked family's billing
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='peer_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$
--   declare fam uuid := (select v::uuid from _dry where k='peer_family'); n int; o int;
--   begin
--     select count(*) into n from public.tuition_charges where family_id = fam;
--     select count(*) into o from public.tuition_charges where family_id <> fam;
--     raise notice 'peer_user linked-family charges=% (expect >0 if the family has charges) other=% (expect 0)', n, o;
--     select count(*) into n from public.tuition_enrollment_assignments where family_id = fam;
--     raise notice 'peer_user linked-family assignments=%', n;
--   end $$;
--   reset role;
--
--   -- Admin and teacher: school-wide reads unchanged
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='admin_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.tuition_charges;
--     raise notice 'admin charges visible=% (expect all in school)', n;
--   end $$;
--   reset role;
--
--   select set_config('request.jwt.claims', json_build_object('sub', (select v from _dry where k='teacher_user'), 'role','authenticated')::text, true);
--   set local role authenticated;
--   do $$ declare n int; begin
--     select count(*) into n from public.tuition_charges;
--     raise notice 'teacher charges visible=% (staff: same as before)', n;
--   end $$;
--   reset role;
--
-- rollback;  -- never commit the dry run

-- ===========================================================================
-- ROLLBACK (restores the broad member-read policies; re-exposes family data to all parents)
-- ===========================================================================
--
-- begin;
--   create policy "Org members read tuition_charges" on public.tuition_charges
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   create policy "Org members read tuition_billing_accounts" on public.tuition_billing_accounts
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   create policy "Org members read tuition_billing_splits" on public.tuition_billing_splits
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   create policy "Org members read tuition_adjustments" on public.tuition_adjustments
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   create policy "Org members read tuition_enrollment_assignments" on public.tuition_enrollment_assignments
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   create policy "Org members read family_payment_methods" on public.family_payment_methods
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
--   create policy "Org members can read document_signatures" on public.document_signatures
--     for select to authenticated using (public.user_is_active_org_member(organization_id));
-- commit;
