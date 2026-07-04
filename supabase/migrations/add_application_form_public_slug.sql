-- Add public_slug to application_form_versions for family-facing form URLs.
-- Run after: add_product_application_form_versions.sql

alter table public.application_form_versions
  add column if not exists public_slug text;

-- Unique slug per org among published forms.
create unique index if not exists application_form_versions_org_public_slug_published_key
  on public.application_form_versions (organization_id, public_slug)
  where status = 'published' and public_slug is not null;

-- Allow anonymous and authenticated users to read published forms (public apply pages).
create policy "Anyone can read published application forms"
  on public.application_form_versions
  for select
  to anon, authenticated
  using (status = 'published');
