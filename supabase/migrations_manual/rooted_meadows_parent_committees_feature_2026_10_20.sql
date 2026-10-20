-- Promoted to supabase/migrations/20261201_rooted_meadows_parent_committees_feature.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
--
-- Enable parent portal Committees for Rooted Meadows when school admin committees is on.

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
