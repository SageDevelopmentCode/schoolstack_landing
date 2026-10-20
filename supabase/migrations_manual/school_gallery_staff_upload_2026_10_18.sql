-- Promoted to supabase/migrations/20261121_school_gallery_staff_upload.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Staff gallery upload + manage own photos
-- Run after: 20261120_add_school_gallery_photos.sql

create policy "Staff insert school_gallery_photos"
  on public.school_gallery_photos for insert to authenticated
  with check (public.user_is_staff_org_member(organization_id));

create policy "Staff update own school_gallery_photos"
  on public.school_gallery_photos for update to authenticated
  using (
    public.user_is_staff_org_member(organization_id)
    and uploaded_by = auth.uid()
  )
  with check (
    public.user_is_staff_org_member(organization_id)
    and uploaded_by = auth.uid()
  );

create policy "Staff delete own school_gallery_photos"
  on public.school_gallery_photos for delete to authenticated
  using (
    public.user_is_staff_org_member(organization_id)
    and uploaded_by = auth.uid()
  );

create policy "Staff insert school-gallery-files storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'school-gallery-files'
    and (storage.foldername(name))[2] = 'gallery'
    and public.user_is_staff_org_member(public.school_gallery_storage_org_id(name))
  );
