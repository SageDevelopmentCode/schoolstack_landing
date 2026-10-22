-- Internal school-staff notes when documenting post-application step completion.
-- Run after: 20261132_add_platform_support_message_threads.sql

alter table public.admissions_scheduled_visits
  add column if not exists admin_completion_notes text null;

comment on column public.admissions_scheduled_visits.admin_completion_notes is
  'Internal notes for school staff documenting a completed post-application step (not shown in family portal).';
