-- Private bucket for admissions application uploads (org-scoped paths).
-- Path layout: {organization_id}/applications/{application_id}/{field_id}/{uuid}_{filename}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-files',
  'application-files',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- storage.foldername(name): [1]=org_id, [2]=applications, [3]=application_id, [4]=field_id
create or replace function public.application_file_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create or replace function public.application_file_storage_application_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

-- Platform admins: full access
create policy "Platform admins manage application-files storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'application-files'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'application-files'
    and public.is_platform_admin()
  );

-- Org members: read files under their organization prefix
create policy "Org members read application-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'application-files'
    and public.user_is_active_org_member(public.application_file_storage_org_id(name))
  );

-- Org admins: delete files under their organization prefix
create policy "Org admins delete application-files storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'application-files'
    and public.user_is_org_admin(public.application_file_storage_org_id(name))
  );

-- Guardians: read files for applications they own
create policy "Guardians read own application-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'application-files'
    and exists (
      select 1
      from public.applications a
      where a.id = public.application_file_storage_application_id(name)
        and a.organization_id = public.application_file_storage_org_id(name)
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

-- Guardians: upload files for applications they own
create policy "Guardians insert own application-files storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'applications'
    and exists (
      select 1
      from public.applications a
      where a.id = public.application_file_storage_application_id(name)
        and a.organization_id = public.application_file_storage_org_id(name)
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

-- Guardians: remove their own uploads before submit
create policy "Guardians delete own application-files storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'application-files'
    and exists (
      select 1
      from public.applications a
      where a.id = public.application_file_storage_application_id(name)
        and a.organization_id = public.application_file_storage_org_id(name)
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );
