-- Promoted to supabase/migrations/20260851_add_program_parent_portal_settings.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Program-scoped parent portal settings (isolated program portals)

alter table public.programs
  add column if not exists portal_slug text,
  add column if not exists parent_portal_settings jsonb not null default '{}'::jsonb;

update public.programs p
set portal_slug = coalesce(
  nullif(
    trim(both '-' from regexp_replace(lower(trim(p.name)), '[^a-z0-9]+', '-', 'g')),
    ''
  ),
  'program'
)
where p.portal_slug is null;

with ranked as (
  select
    id,
    portal_slug,
    row_number() over (
      partition by organization_id, portal_slug
      order by created_at asc, id asc
    ) as rn
  from public.programs
)
update public.programs p
set portal_slug = p.portal_slug || '-' || ranked.rn
from ranked
where p.id = ranked.id
  and ranked.rn > 1;

alter table public.programs
  alter column portal_slug set not null;

create unique index if not exists programs_organization_portal_slug_uidx
  on public.programs (organization_id, portal_slug);
