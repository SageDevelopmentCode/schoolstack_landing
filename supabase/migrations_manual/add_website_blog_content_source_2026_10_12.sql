-- Promoted to supabase/migrations/20261117_add_website_blog_content_source.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.website_blog_posts
  add column if not exists content_source text not null default 'html';

alter table public.website_blog_posts
  drop constraint if exists website_blog_posts_content_source_check;

alter table public.website_blog_posts
  add constraint website_blog_posts_content_source_check
  check (content_source in ('html', 'repo'));

update public.website_blog_posts
set
  content_source = 'repo',
  body_html = '',
  updated_at = now()
where slug = 'simplify-microschool-newsletters';
