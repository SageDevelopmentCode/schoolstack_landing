-- Promoted to supabase/migrations/20261131_add_platform_support_message_kinds.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Run this file first, then add_platform_support_message_threads_2026_10_20.sql.
-- Enum values cannot be used in the same transaction that adds them.

alter type public.message_participant_kind add value if not exists 'platform_support';

alter type public.portal_message_sender_kind add value if not exists 'platform_support';
