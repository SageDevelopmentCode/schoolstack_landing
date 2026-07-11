-- Public bucket for per-school branding assets (logos).
-- Path layout: {organization_id}/logo.{ext}

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'organization-branding',
  'organization-branding',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.organization_branding_storage_org_id(object_path text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_path))[1], '')::uuid;
$$;

-- Anyone can read logos (public apply pages, school admin)
create policy "Public read organization-branding storage"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'organization-branding');

-- Platform admins: full access
create policy "Platform admins manage organization-branding storage"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'organization-branding'
    and public.is_platform_admin()
  )
  with check (
    bucket_id = 'organization-branding'
    and public.is_platform_admin()
  );

-- Org admins: manage files under their organization prefix
create policy "Org admins insert organization-branding storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'organization-branding'
    and public.user_is_org_admin(public.organization_branding_storage_org_id(name))
  );

create policy "Org admins update organization-branding storage"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'organization-branding'
    and public.user_is_org_admin(public.organization_branding_storage_org_id(name))
  )
  with check (
    bucket_id = 'organization-branding'
    and public.user_is_org_admin(public.organization_branding_storage_org_id(name))
  );

create policy "Org admins delete organization-branding storage"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'organization-branding'
    and public.user_is_org_admin(public.organization_branding_storage_org_id(name))
  );
