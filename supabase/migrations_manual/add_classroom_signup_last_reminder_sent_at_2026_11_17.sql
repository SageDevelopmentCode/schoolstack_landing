-- Promoted to supabase/migrations/20261167_add_classroom_signup_last_reminder_sent_at.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.classroom_signups
  add column if not exists last_reminder_sent_at timestamptz;

comment on column public.classroom_signups.last_reminder_sent_at is
  'Set when a teacher reminder is claimed/sent; used to enforce the hourly reminder cooldown.';

-- Preserve existing cooldowns after deploy (optional; safe to re-run).
update public.classroom_signups cs
set last_reminder_sent_at = sub.last_sent
from (
  select entity_id as signup_id, max(created_at) as last_sent
  from public.activity_events
  where action = 'classroom_signup.reminder_sent'
    and entity_type = 'classroom_signup'
  group by entity_id
) sub
where cs.id = sub.signup_id
  and (cs.last_reminder_sent_at is null or cs.last_reminder_sent_at < sub.last_sent);