-- Promoted to supabase/migrations/20261113_committee_section_unread_digest.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.committee_member_section_reads
  add column if not exists last_unread_digest_notified_at timestamptz;
