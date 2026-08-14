-- Promoted to supabase/migrations/20260819_add_staff_profile_photos.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- 2026-08-13: Staff profile photos column + staff-photos storage bucket.

alter table public.staff_members
  add column if not exists profile_photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'staff-photos',
  'staff-photos',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.staff_photos_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.staff_photos_storage_staff_member_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[2], '')::uuid;
$$;

drop policy if exists "Public read staff-photos storage" on storage.objects;
create policy "Public read staff-photos storage"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'staff-photos');

drop policy if exists "Platform admins manage staff-photos storage" on storage.objects;
create policy "Platform admins manage staff-photos storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'staff-photos'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'staff-photos'
    and public.is_platform_admin()
  );

drop policy if exists "Org admins insert staff-photos storage" on storage.objects;
create policy "Org admins insert staff-photos storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'staff-photos'
    and public.user_is_org_admin(public.staff_photos_storage_org_id(name))
  );

drop policy if exists "Org admins update staff-photos storage" on storage.objects;
create policy "Org admins update staff-photos storage"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'staff-photos'
    and public.user_is_org_admin(public.staff_photos_storage_org_id(name))
  )
  with check (
    bucket_id = 'staff-photos'
    and public.user_is_org_admin(public.staff_photos_storage_org_id(name))
  );

drop policy if exists "Org admins delete staff-photos storage" on storage.objects;
create policy "Org admins delete staff-photos storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'staff-photos'
    and public.user_is_org_admin(public.staff_photos_storage_org_id(name))
  );
