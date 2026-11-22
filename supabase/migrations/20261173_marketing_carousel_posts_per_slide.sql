-- MudKitchen marketing studio: posted status per slide of an ad set or post set.
-- slide_id = '' is the whole entry (swipe carousels, and every row that existed before this migration).
-- Run after: 20261118_add_website_marketing_carousel_posts.sql

alter table public.website_marketing_carousel_posts
  add column if not exists slide_id text not null default '';

alter table public.website_marketing_carousel_posts
  drop constraint if exists website_marketing_carousel_posts_pkey;

alter table public.website_marketing_carousel_posts
  add constraint website_marketing_carousel_posts_pkey primary key (carousel_id, slide_id);
