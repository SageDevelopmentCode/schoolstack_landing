-- Promoted to supabase/migrations/20261103_portal_link_membership_helpers.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if the drop policy has not been applied
-- (e.g. helpers were applied from portal_link_membership_helpers_2026_09_28.sql only).

drop policy if exists "Participants update own portal_messages" on public.portal_messages;
