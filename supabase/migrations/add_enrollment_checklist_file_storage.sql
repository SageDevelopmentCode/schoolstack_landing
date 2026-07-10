-- Family enrollment checklist file uploads under application-files bucket.
-- Path layout: {organization_id}/enrollment-checklists/{checklist_id}/{instance_id}/{uuid}_{filename}

create or replace function public.enrollment_checklist_storage_checklist_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[3], '')::uuid;
$$;

create or replace function public.user_can_access_enrollment_checklist_storage(
  p_checklist_id uuid,
  p_org_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollment_checklists ec
    left join public.applications a on a.id = ec.application_id
    where ec.id = p_checklist_id
      and ec.organization_id = p_org_id
      and (
        public.user_is_guardian_for_enrollment(ec.enrollment_id)
        or a.created_by_user_id = auth.uid()
        or (
          a.family_id is not null
          and public.user_is_guardian_for_family(a.family_id)
        )
      )
  );
$$;

create policy "Guardians insert enrollment checklist file storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'enrollment-checklists'
    and public.user_can_access_enrollment_checklist_storage(
      public.enrollment_checklist_storage_checklist_id(name),
      public.application_file_storage_org_id(name)
    )
  );

create policy "Guardians read enrollment checklist file storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'enrollment-checklists'
    and public.user_can_access_enrollment_checklist_storage(
      public.enrollment_checklist_storage_checklist_id(name),
      public.application_file_storage_org_id(name)
    )
  );

create policy "Guardians delete enrollment checklist file storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'enrollment-checklists'
    and public.user_can_access_enrollment_checklist_storage(
      public.enrollment_checklist_storage_checklist_id(name),
      public.application_file_storage_org_id(name)
    )
  );

create policy "Org admins manage enrollment checklist file storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'enrollment-checklists'
    and public.user_is_org_admin(public.application_file_storage_org_id(name))
  )
  with check (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'enrollment-checklists'
    and public.user_is_org_admin(public.application_file_storage_org_id(name))
  );
