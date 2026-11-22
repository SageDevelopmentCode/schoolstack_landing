-- Promoted to supabase/migrations/20261173_marketing_carousel_posts_per_slide.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-11-21: Per-slide posted status for /admin/marketing ad sets and post sets.

alter table public.website_marketing_carousel_posts
  add column if not exists slide_id text not null default '';

alter table public.website_marketing_carousel_posts
  drop constraint if exists website_marketing_carousel_posts_pkey;

alter table public.website_marketing_carousel_posts
  add constraint website_marketing_carousel_posts_pkey primary key (carousel_id, slide_id);
