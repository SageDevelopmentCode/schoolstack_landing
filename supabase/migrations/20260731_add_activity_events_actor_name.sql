-- Readable admin activity log previews (populated at write time in logActivityEvent).

alter table public.activity_events
  add column if not exists actor_name text;
