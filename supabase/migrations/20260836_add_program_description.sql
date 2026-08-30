-- Optional internal description for programs (admin workspace).
-- Run after: 20260835_add_school_admin_activity_notification_reads.sql

alter table public.programs
  add column if not exists description text;
