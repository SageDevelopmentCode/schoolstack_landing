-- Promoted to supabase/migrations/20261134_restrict_post_submit_internal_files_guardian_access.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Exclude internal post-submit step documentation from guardian access on application_files and storage.
-- field_id prefix and post-submit path segment must stay in sync with post-submit-step-documentation.ts

create or replace function public.is_post_submit_step_internal_application_file(p_field_id text)
returns boolean
language sql
immutable
as $$
  select p_field_id like 'post_submit_step:%';
$$;

create or replace function public.is_post_submit_step_internal_storage_path(object_path text)
returns boolean
language sql
immutable
as $$
  select coalesce((storage.foldername(object_path))[4], '') = 'post-submit';
$$;

-- ── application_files ───────────────────────────────────────────────────────

drop policy if exists "Guardians can read own application files" on public.application_files;

create policy "Guardians can read own application files"
  on public.application_files
  for select
  to authenticated
  using (
    not public.is_post_submit_step_internal_application_file(field_id)
    and exists (
      select 1
      from public.applications a
      where a.id = application_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

drop policy if exists "Guardians can insert own application files" on public.application_files;

create policy "Guardians can insert own application files"
  on public.application_files
  for insert
  to authenticated
  with check (
    not public.is_post_submit_step_internal_application_file(field_id)
    and exists (
      select 1
      from public.applications a
      where a.id = application_id
        and a.organization_id = application_files.organization_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

drop policy if exists "Guardians can delete own application files" on public.application_files;

create policy "Guardians can delete own application files"
  on public.application_files
  for delete
  to authenticated
  using (
    not public.is_post_submit_step_internal_application_file(field_id)
    and exists (
      select 1
      from public.applications a
      where a.id = application_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );

-- ── application-files storage (applications/* paths) ─────────────────────────

drop policy if exists "Guardians read own application-files storage" on storage.objects;

create policy "Guardians read own application-files storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'application-files'
    and not public.is_post_submit_step_internal_storage_path(name)
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

drop policy if exists "Guardians insert own application-files storage" on storage.objects;

create policy "Guardians insert own application-files storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'applications'
    and not public.is_post_submit_step_internal_storage_path(name)
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

drop policy if exists "Guardians delete own application-files storage" on storage.objects;

create policy "Guardians delete own application-files storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'application-files'
    and not public.is_post_submit_step_internal_storage_path(name)
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
