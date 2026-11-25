-- /admin/research: the handwritten letter is written, addressed and stamped, waiting to be posted.
-- Set/cleared from the letter card; "Log letter mailed" (a mail touch) still starts the email clock.
-- Run after: 20261176_expand_push_kinds_signup_reminder_staff_hours.sql

alter table public.schools add column if not exists letter_ready_at timestamptz;
