-- Promoted to supabase/migrations/20261120_add_school_gallery_photos.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- School gallery photos for admin upload and parent/teacher read
-- Run after: 20261119_revert_tuition_ach_settlement_atomic.sql

create table if not exists public.school_gallery_photos (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  photo_date       date not null,
  storage_path     text not null unique,
  file_name        text not null,
  mime_type        text,
  size_bytes       bigint,
  upload_batch_id  uuid,
  uploaded_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists school_gallery_photos_org_photo_date_idx
  on public.school_gallery_photos (organization_id, photo_date desc);

create index if not exists school_gallery_photos_org_created_at_idx
  on public.school_gallery_photos (organization_id, created_at desc);

drop trigger if exists on_school_gallery_photos_updated on public.school_gallery_photos;
create trigger on_school_gallery_photos_updated
  before update on public.school_gallery_photos
  for each row execute procedure public.handle_updated_at();

alter table public.school_gallery_photos enable row level security;

create policy "Platform admins manage school_gallery_photos"
  on public.school_gallery_photos for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage school_gallery_photos"
  on public.school_gallery_photos for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create policy "Enrolled parents read school_gallery_photos"
  on public.school_gallery_photos for select to authenticated
  using (public.user_has_enrolled_parent_access(organization_id));

create policy "Staff read school_gallery_photos"
  on public.school_gallery_photos for select to authenticated
  using (public.user_is_staff_org_member(organization_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-gallery-files',
  'school-gallery-files',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.school_gallery_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.school_gallery_storage_photo_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create policy "Platform admins manage school-gallery-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'school-gallery-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'school-gallery-files'
    and public.is_platform_admin()
  );

create policy "Org admins manage school-gallery-files storage"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'school-gallery-files'
    and public.user_is_org_admin(public.school_gallery_storage_org_id(name))
  )
  with check (
    bucket_id = 'school-gallery-files'
    and (storage.foldername(name))[2] = 'gallery'
    and public.user_is_org_admin(public.school_gallery_storage_org_id(name))
  );

create policy "Readers read school-gallery-files storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'school-gallery-files'
    and exists (
      select 1
      from public.school_gallery_photos g
      where g.id = public.school_gallery_storage_photo_id(name)
        and (
          public.user_is_org_admin(g.organization_id)
          or public.user_has_enrolled_parent_access(g.organization_id)
          or public.user_is_staff_org_member(g.organization_id)
        )
    )
  );

create policy "Org admins insert school-gallery-files storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'school-gallery-files'
    and (storage.foldername(name))[2] = 'gallery'
    and public.user_is_org_admin(public.school_gallery_storage_org_id(name))
  );

create policy "Org admins delete school-gallery-files storage"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'school-gallery-files'
    and public.user_is_org_admin(public.school_gallery_storage_org_id(name))
  );
