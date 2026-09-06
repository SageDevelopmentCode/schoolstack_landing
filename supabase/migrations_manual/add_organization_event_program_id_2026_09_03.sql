-- Promoted to supabase/migrations/20260852_add_organization_event_program_id.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-09-03

alter table public.organization_events
  add column if not exists program_id uuid references public.programs(id) on delete set null;

create index if not exists organization_events_org_program_date_idx
  on public.organization_events (organization_id, program_id, event_date);
