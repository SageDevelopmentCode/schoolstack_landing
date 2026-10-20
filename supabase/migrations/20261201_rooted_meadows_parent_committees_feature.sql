-- Enable parent portal Committees for Rooted Meadows when school admin committees is on.
-- Run after: 20261130_enforce_organization_school_profile_photo_limit.sql

update public.organization_settings os
set features = jsonb_set(
  coalesce(os.features, '{}'::jsonb),
  '{parent,committees}',
  'true'::jsonb,
  true
)
from public.organizations o
where o.id = os.organization_id
  and o.slug = 'rooted-meadows'
  and coalesce(os.features->'admin'->>'committees', 'true') = 'true';
