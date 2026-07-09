-- Checklist template PDF storage under application-files bucket.
-- Path layout: {organization_id}/checklist-templates/{template_id}/{item_id}/{uuid}_{filename}

create or replace function public.checklist_template_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

create policy "Org admins manage checklist-template PDF storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'checklist-templates'
    and public.user_is_org_admin(public.checklist_template_storage_org_id(name))
  )
  with check (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'checklist-templates'
    and public.user_is_org_admin(public.checklist_template_storage_org_id(name))
  );

create policy "Org members read checklist-template PDF storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'application-files'
    and (storage.foldername(name))[2] = 'checklist-templates'
    and public.user_is_active_org_member(public.checklist_template_storage_org_id(name))
  );
