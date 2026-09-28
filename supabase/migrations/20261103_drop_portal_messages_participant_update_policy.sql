-- Remove participant PostgREST UPDATE on portal_messages; edits/deletes use service role via API.
-- Run after: 20261102_fix_portal_account_link_members_rls.sql

drop policy if exists "Participants update own portal_messages" on public.portal_messages;
