-- Public readers only need branding, features, and Friday Branch settings.
-- The previous row-level policy exposed notifications, tuition, schedule, and school_profile.
-- Run after: 20261127_school_gallery_immutable_photo_identity.sql

create or replace view public.organization_settings_public
with (security_invoker = false, security_barrier = true) as
select
  s.organization_id,
  s.branding,
  s.features,
  s.friday_branch
from public.organization_settings s
join public.organizations o on o.id = s.organization_id
where o.status != 'churned';

grant select on public.organization_settings_public to anon, authenticated;

revoke insert, update, delete on public.organization_settings_public from anon, authenticated;

drop policy if exists "Public can read organization settings for active orgs"
  on public.organization_settings;
