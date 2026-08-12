-- Student profile photos: column on students + public storage bucket.
-- Path layout: {organization_id}/{student_id}/photo.webp
-- Run after: 20260812_add_organization_events.sql

alter table public.students
  add column if not exists profile_photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-photos',
  'student-photos',
  true,
  1048576,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.student_photos_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.student_photos_storage_student_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[2], '')::uuid;
$$;

-- Anyone can read student photos (parent, teacher, school admin portals)
drop policy if exists "Public read student-photos storage" on storage.objects;
create policy "Public read student-photos storage"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'student-photos');

-- Platform admins: full access
drop policy if exists "Platform admins manage student-photos storage" on storage.objects;
create policy "Platform admins manage student-photos storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'student-photos'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'student-photos'
    and public.is_platform_admin()
  );

-- Org admins: manage files under their organization prefix
drop policy if exists "Org admins insert student-photos storage" on storage.objects;
create policy "Org admins insert student-photos storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'student-photos'
    and public.user_is_org_admin(public.student_photos_storage_org_id(name))
  );

drop policy if exists "Org admins update student-photos storage" on storage.objects;
create policy "Org admins update student-photos storage"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'student-photos'
    and public.user_is_org_admin(public.student_photos_storage_org_id(name))
  )
  with check (
    bucket_id = 'student-photos'
    and public.user_is_org_admin(public.student_photos_storage_org_id(name))
  );

drop policy if exists "Org admins delete student-photos storage" on storage.objects;
create policy "Org admins delete student-photos storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'student-photos'
    and public.user_is_org_admin(public.student_photos_storage_org_id(name))
  );
