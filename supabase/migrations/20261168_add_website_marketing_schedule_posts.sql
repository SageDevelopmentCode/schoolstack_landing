-- MudKitchen marketing studio: status per scheduled social post (Planned / Scheduled / Posted).
-- Item ids come from src/lib/marketing/social-schedule.ts. A missing row means "planned".
-- Run after: 20261118_add_website_marketing_carousel_posts.sql

create table if not exists public.website_marketing_schedule_posts (
  item_id     text primary key,
  status      text not null default 'planned'
              check (status in ('planned', 'scheduled', 'posted')),
  updated_at  timestamptz not null default now()
);

drop trigger if exists on_website_marketing_schedule_posts_updated
  on public.website_marketing_schedule_posts;
create trigger on_website_marketing_schedule_posts_updated
  before update on public.website_marketing_schedule_posts
  for each row execute procedure public.handle_updated_at();

alter table public.website_marketing_schedule_posts enable row level security;

drop policy if exists "Platform admins manage website marketing schedule posts"
  on public.website_marketing_schedule_posts;
create policy "Platform admins manage website marketing schedule posts"
  on public.website_marketing_schedule_posts
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
