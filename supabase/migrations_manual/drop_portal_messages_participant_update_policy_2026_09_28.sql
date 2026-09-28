-- Promoted to supabase/migrations/20261103_drop_portal_messages_participant_update_policy.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

drop policy if exists "Participants update own portal_messages" on public.portal_messages;
