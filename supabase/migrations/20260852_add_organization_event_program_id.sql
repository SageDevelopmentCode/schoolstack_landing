-- Scope calendar events to a program portal audience (nullable = school-wide).
-- Run after: 20260851_add_program_parent_portal_settings.sql

alter table public.organization_events
  add column if not exists program_id uuid references public.programs(id) on delete set null;

create index if not exists organization_events_org_program_date_idx
  on public.organization_events (organization_id, program_id, event_date);
