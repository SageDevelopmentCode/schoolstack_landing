-- Promoted to supabase/migrations/20261115_add_website_marketing_storage.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
--
-- After apply: upload get-started film to
--   website-marketing / marketing/get-started/mudkitchen-16x9.mp4
-- Set Vercel NEXT_PUBLIC_GET_STARTED_FILM_VIDEO_URL to the public object URL.

-- Public bucket for MudKitchen marketing site assets (e.g. get-started product film).
-- Path layout: marketing/get-started/mudkitchen-16x9.mp4

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'website-marketing',
  'website-marketing',
  true,
  54525952,
  array['video/mp4', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read website-marketing storage"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'website-marketing');

create policy "Platform admins manage website-marketing storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'website-marketing'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'website-marketing'
    and public.is_platform_admin()
  );
