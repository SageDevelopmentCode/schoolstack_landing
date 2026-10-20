-- Allow uploaded_by ON DELETE SET NULL when auth users are removed
-- Run after: 20261128_restrict_public_organization_settings.sql

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
     or new.storage_path is distinct from old.storage_path then
    raise exception 'school_gallery_photo_identity_immutable'
      using hint = 'organization_id and storage_path cannot be changed';
  end if;

  if new.uploaded_by is distinct from old.uploaded_by
     and not (old.uploaded_by is not null and new.uploaded_by is null) then
    raise exception 'school_gallery_photo_identity_immutable'
      using hint = 'organization_id and storage_path cannot be changed; uploaded_by cannot be reassigned';
  end if;

  return new;
end;
$$;
