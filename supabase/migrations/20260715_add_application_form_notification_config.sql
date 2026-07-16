-- Per-form notification settings (e.g. emails to notify on new submissions)
alter table public.application_form_versions
  add column if not exists notification_config jsonb not null
  default '{"submission_notify_emails":[]}'::jsonb;
