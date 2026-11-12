-- Local and CI school for the free-tier dashboard. Not a customer.
-- Run after: 20261156_add_organization_plan.sql
-- Re-running does not change an existing row (an upgraded plan stays custom).

insert into public.organizations (slug, name, status, timezone, plan)
values (
  'free-tier-school',
  'Free Tier School',
  'live',
  'America/Chicago',
  'free'
)
on conflict (slug) do nothing;

insert into public.organization_settings (organization_id, features)
select id, '{}'::jsonb
from public.organizations
where slug = 'free-tier-school'
on conflict (organization_id) do nothing;
