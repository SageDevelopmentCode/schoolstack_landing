-- Promoted to supabase/migrations/20260832_drop_org_admin_support_request_read_policy.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
--
-- Revoke school org admin read access to support requests.
-- Viewing is platform-admin only (/admin/tickets). Submission via school-admin FAB remains.

drop policy if exists "Org admins can read their org support requests"
  on public.admin_support_requests;
