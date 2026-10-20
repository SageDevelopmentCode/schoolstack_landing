-- Freeze gallery photo tenant identity after insert; tighten staff insert and storage read RLS
-- Run after: 20261126_add_organization_school_profile_photos.sql

create or replace function public.enforce_school_gallery_photo_identity_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_platform_admin() then
    return new;
  end if;

  if new.organization_id is distinct from old.organization_id
     or new.storage_path is distinct from old.storage_path
     or new.uploaded_by is distinct from old.uploaded_by then
    raise exception 'school_gallery_photo_identity_immutable'
      using hint = 'organization_id, storage_path, and uploaded_by cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_school_gallery_photo_identity_immutable
  on public.school_gallery_photos;
create trigger enforce_school_gallery_photo_identity_immutable
  before update on public.school_gallery_photos
  for each row execute function public.enforce_school_gallery_photo_identity_immutable();

drop policy if exists "Staff insert school_gallery_photos" on public.school_gallery_photos;
create policy "Staff insert school_gallery_photos"
  on public.school_gallery_photos for insert to authenticated
  with check (
    public.user_is_staff_org_member(organization_id)
    and uploaded_by = auth.uid()
  );

drop policy if exists "Readers read school-gallery-files storage" on storage.objects;
create policy "Readers read school-gallery-files storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'school-gallery-files'
    and exists (
      select 1
      from public.school_gallery_photos g
      where g.id = public.school_gallery_storage_photo_id(name)
        and public.school_gallery_storage_org_id(name) = g.organization_id
        and (
          public.user_is_org_admin(g.organization_id)
          or public.user_has_enrolled_parent_access(g.organization_id)
          or public.user_is_staff_org_member(g.organization_id)
        )
    )
  );
