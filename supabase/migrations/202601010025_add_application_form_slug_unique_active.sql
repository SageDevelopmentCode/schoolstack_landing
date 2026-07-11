-- Enforce unique public_slug per org among draft and published forms.
-- Run after: add_application_form_public_slug.sql

drop index if exists public.application_form_versions_org_public_slug_published_key;

create unique index if not exists application_form_versions_org_public_slug_active_key
  on public.application_form_versions (organization_id, public_slug)
  where status in ('draft', 'published')
    and public_slug is not null;
