-- Track when bulletin publish emails were sent (idempotency for cron + immediate send).
-- Run after: 20260907_bulletin_multi_audience.sql

alter table public.school_bulletin_posts
  add column if not exists published_email_sent_at timestamptz;

comment on column public.school_bulletin_posts.published_email_sent_at is
  'When publish notification emails were sent; null until sent.';

update public.school_bulletin_posts
set published_email_sent_at = coalesce(published_at, created_at)
where status = 'published'
  and published_email_sent_at is null;
