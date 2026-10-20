-- One-off data: enable parent portal Committees for Rooted Meadows when school admin committees is on.
-- Run in Supabase SQL Editor on remote after review (not applied by supabase db reset or CI).

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
