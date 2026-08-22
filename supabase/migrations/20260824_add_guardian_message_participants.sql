-- Per-guardian messaging: add enum value (must run in its own migration)
-- Run after: 20260823_family_notification_emails_max_three.sql

ALTER TYPE public.message_participant_kind ADD VALUE IF NOT EXISTS 'guardian';
