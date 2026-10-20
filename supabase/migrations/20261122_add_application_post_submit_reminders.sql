-- Track post-submit required-step reminder emails per submitted application.
-- Run after: 20261121_school_gallery_staff_upload.sql

alter table public.applications
  add column if not exists post_submit_reminder_count smallint not null default 0,
  add column if not exists post_submit_reminder_sent_at timestamptz;

create index if not exists applications_post_submit_reminder_idx
  on public.applications (organization_id, post_submit_reminder_count)
  where post_submit_reminder_count < 2
    and submitted_at is not null;
