-- Promoted to supabase/migrations/20261174_demo_requests_meeting_link.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Meeting link the admin emails to a prospect ~24h before their demo call,
-- and when that email went out (null = not sent yet).
-- Run after: 202601010002_add_demo_requests.sql

alter table public.demo_requests
  add column if not exists meeting_link text,
  add column if not exists meeting_link_sent_at timestamptz;
