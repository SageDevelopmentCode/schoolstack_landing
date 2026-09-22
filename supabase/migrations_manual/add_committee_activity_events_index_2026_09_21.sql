-- Promoted to supabase/migrations/20261016_add_committee_activity_events_index.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create index if not exists activity_events_org_committee_created_idx
  on public.activity_events (organization_id, ((metadata->>'committeeId')), created_at desc)
  where metadata ? 'committeeId';
