-- School profile photos (My School subtab, max 5 per org)
-- Run after: 20261124_add_scheduled_visit_day_of_parent_reminder.sql

create table if not exists public.organization_school_profile_photos (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  storage_path     text not null unique,
  file_name        text not null,
  mime_type        text,
  size_bytes       bigint,
  sort_order       integer not null default 0,
  uploaded_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists organization_school_profile_photos_org_sort_idx
  on public.organization_school_profile_photos (organization_id, sort_order);

drop trigger if exists on_organization_school_profile_photos_updated
  on public.organization_school_profile_photos;
create trigger on_organization_school_profile_photos_updated
  before update on public.organization_school_profile_photos
  for each row execute procedure public.handle_updated_at();

alter table public.organization_school_profile_photos enable row level security;

create policy "Platform admins manage organization_school_profile_photos"
  on public.organization_school_profile_photos for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage organization_school_profile_photos"
  on public.organization_school_profile_photos for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

create or replace function public.school_profile_photo_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.school_profile_photo_storage_photo_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create policy "Org admins insert school-profile storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'school-gallery-files'
    and (storage.foldername(name))[2] = 'school-profile'
    and public.user_is_org_admin(public.school_profile_photo_storage_org_id(name))
  );

create policy "Org admins read school-profile storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'school-gallery-files'
    and exists (
      select 1
      from public.organization_school_profile_photos p
      where p.id = public.school_profile_photo_storage_photo_id(name)
        and public.user_is_org_admin(p.organization_id)
    )
  );

create policy "Org admins delete school-profile storage"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'school-gallery-files'
    and public.user_is_org_admin(public.school_profile_photo_storage_org_id(name))
    and (storage.foldername(name))[2] = 'school-profile'
  );
