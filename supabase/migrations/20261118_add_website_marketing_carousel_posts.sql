-- MudKitchen marketing studio: shared posted status per carousel/ad
-- Run after: 20261117_add_website_blog_content_source.sql

create table if not exists public.website_marketing_carousel_posts (
  carousel_id text primary key,
  posted      boolean not null default false,
  posted_at   timestamptz,
  updated_at  timestamptz not null default now()
);

drop trigger if exists on_website_marketing_carousel_posts_updated
  on public.website_marketing_carousel_posts;
create trigger on_website_marketing_carousel_posts_updated
  before update on public.website_marketing_carousel_posts
  for each row execute procedure public.handle_updated_at();

alter table public.website_marketing_carousel_posts enable row level security;

drop policy if exists "Platform admins manage website marketing carousel posts"
  on public.website_marketing_carousel_posts;
create policy "Platform admins manage website marketing carousel posts"
  on public.website_marketing_carousel_posts
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
