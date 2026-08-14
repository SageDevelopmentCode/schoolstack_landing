-- Promoted to supabase/migrations/20260818_add_guardian_profile_photos.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-08-13: Guardian profile photos column + guardian-photos storage bucket.

alter table public.guardians
  add column if not exists profile_photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guardian-photos',
  'guardian-photos',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.guardian_photos_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.guardian_photos_storage_guardian_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[2], '')::uuid;
$$;

drop policy if exists "Public read guardian-photos storage" on storage.objects;
create policy "Public read guardian-photos storage"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'guardian-photos');

drop policy if exists "Platform admins manage guardian-photos storage" on storage.objects;
create policy "Platform admins manage guardian-photos storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'guardian-photos'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'guardian-photos'
    and public.is_platform_admin()
  );

drop policy if exists "Org admins insert guardian-photos storage" on storage.objects;
create policy "Org admins insert guardian-photos storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'guardian-photos'
    and public.user_is_org_admin(public.guardian_photos_storage_org_id(name))
  );

drop policy if exists "Org admins update guardian-photos storage" on storage.objects;
create policy "Org admins update guardian-photos storage"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'guardian-photos'
    and public.user_is_org_admin(public.guardian_photos_storage_org_id(name))
  )
  with check (
    bucket_id = 'guardian-photos'
    and public.user_is_org_admin(public.guardian_photos_storage_org_id(name))
  );

drop policy if exists "Org admins delete guardian-photos storage" on storage.objects;
create policy "Org admins delete guardian-photos storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'guardian-photos'
    and public.user_is_org_admin(public.guardian_photos_storage_org_id(name))
  );
