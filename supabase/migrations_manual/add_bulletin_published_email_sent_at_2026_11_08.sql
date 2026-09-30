-- Promoted to supabase/migrations/20261108_bulletin_published_email_sent_at.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08

alter table public.school_bulletin_posts
  add column if not exists published_email_sent_at timestamptz;

comment on column public.school_bulletin_posts.published_email_sent_at is
  'When publish notification emails were sent; null until sent.';

update public.school_bulletin_posts
set published_email_sent_at = coalesce(published_at, created_at)
where status = 'published'
  and published_email_sent_at is null;
