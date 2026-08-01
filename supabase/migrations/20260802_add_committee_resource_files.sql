-- Committee resource file uploads (Supabase Storage).
-- Run after: 20260801_add_committee_join_requests.sql

alter table public.committee_resources
  add column if not exists storage_path text,
  add column if not exists file_name text;

-- Private bucket for committee resource uploads.
-- Path layout: {organization_id}/committees/{committee_id}/{file_id}_{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'committee-resource-files',
  'committee-resource-files',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- storage.foldername(name): [1]=org_id, [2]=committees, [3]=committee_id

create or replace function public.committee_resource_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.committee_resource_storage_committee_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create policy "Platform admins manage committee-resource-files storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'committee-resource-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'committee-resource-files'
    and public.is_platform_admin()
  );

create policy "Org admins manage committee-resource-files storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'committee-resource-files'
    and public.user_is_org_admin(public.committee_resource_storage_org_id(name))
  )
  with check (
    bucket_id = 'committee-resource-files'
    and (storage.foldername(name))[2] = 'committees'
    and public.user_is_org_admin(public.committee_resource_storage_org_id(name))
  );

create policy "Staff read committee-resource-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'committee-resource-files'
    and public.user_is_staff_org_member(public.committee_resource_storage_org_id(name))
  );

create policy "Committee members read committee-resource-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'committee-resource-files'
    and public.user_is_committee_member(
      public.committee_resource_storage_committee_id(name)
    )
  );
