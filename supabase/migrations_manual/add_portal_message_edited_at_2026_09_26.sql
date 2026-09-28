-- Promoted to supabase/migrations/20261029_add_portal_message_edited_at.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
--
-- Adds edited_at only. Do not recreate "Participants update own portal_messages";
-- message edits/deletes use the API (service role). If that UPDATE policy still
-- exists from an old partial apply, run drop_portal_messages_participant_update_policy_2026_09_28.sql
-- (or 20261103_portal_link_membership_helpers.sql) instead of creating it here.

alter table public.portal_messages
  add column if not exists edited_at timestamptz null;
