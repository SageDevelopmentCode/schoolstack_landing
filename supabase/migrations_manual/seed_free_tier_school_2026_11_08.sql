-- Promoted to supabase/migrations/20261157_seed_free_tier_school.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Date: 2026-11-08 — local/CI free-tier test school. Not a customer.
-- Re-running does not change an existing row.

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
