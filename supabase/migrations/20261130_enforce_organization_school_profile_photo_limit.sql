-- Enforce max 5 school profile photos per org under concurrent uploads.
-- Must stay in sync with MAX_SCHOOL_PROFILE_PHOTOS in
-- src/lib/school-admin/school-profile-photos/constants.ts
-- Run after: 20261129_fix_school_gallery_photo_identity_uploaded_by_set_null.sql

create or replace function public.enforce_organization_school_profile_photo_limit()
returns trigger
language plpgsql
as $$
declare
  v_count int;
  v_max constant int := 5;
begin
  perform pg_advisory_xact_lock(
    hashtext('organization_school_profile_photos:' || NEW.organization_id::text)
  );

  select count(*)::int
  into v_count
  from public.organization_school_profile_photos
  where organization_id = NEW.organization_id;

  if v_count >= v_max then
    raise exception 'school_profile_photo_max_photos'
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$;

drop trigger if exists enforce_organization_school_profile_photo_limit
  on public.organization_school_profile_photos;
create trigger enforce_organization_school_profile_photo_limit
  before insert on public.organization_school_profile_photos
  for each row execute function public.enforce_organization_school_profile_photo_limit();
