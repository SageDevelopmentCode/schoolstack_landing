-- Repo vs HTML blog body source
-- Run after: 20261116_add_website_blog_posts.sql

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
