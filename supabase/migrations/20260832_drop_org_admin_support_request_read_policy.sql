-- Revoke school org admin read access to support requests.
-- Viewing is platform-admin only (/admin/tickets). Submission via school-admin FAB remains.
-- Run after: 20260717_add_admin_support_request_ticket_policies.sql

drop policy if exists "Org admins can read their org support requests"
  on public.admin_support_requests;
