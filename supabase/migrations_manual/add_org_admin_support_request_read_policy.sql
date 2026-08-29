-- DEPRECATED — do not re-apply.
-- This policy was removed 2026-08-29. Support request viewing is platform-admin only.
-- See: supabase/migrations/20260832_drop_org_admin_support_request_read_policy.sql
--
-- 2026-07-26: Allow school org admins to read their own MudKitchen support requests.
-- Run in Supabase SQL Editor after 20260716_add_admin_support_requests.sql.

create policy "Org admins can read their org support requests"
  on public.admin_support_requests
  for select
  to authenticated
  using (public.user_is_org_admin(organization_id));
