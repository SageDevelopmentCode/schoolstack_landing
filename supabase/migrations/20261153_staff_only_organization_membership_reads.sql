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
