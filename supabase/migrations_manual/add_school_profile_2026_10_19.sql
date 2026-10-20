-- Promoted to supabase/migrations/20261123_add_school_profile.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.organization_settings
  add column if not exists school_profile jsonb not null default '{}'::jsonb;

create table if not exists public.organization_campuses (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  name              text not null default 'Main campus',
  is_primary        boolean not null default false,
  address_line1     text,
  address_line2     text,
  city              text,
  state_region      text,
  postal_code       text,
  country_code      text not null default 'US',
  phones            jsonb not null default '[]'::jsonb,
  emails            jsonb not null default '[]'::jsonb,
  office_hours      jsonb not null default '[]'::jsonb,
  office_hours_notes text,
  directions_notes  text,
  parking_notes     text,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists organization_campuses_organization_id_idx
  on public.organization_campuses (organization_id);

create unique index if not exists organization_campuses_one_primary_per_org_idx
  on public.organization_campuses (organization_id)
  where is_primary = true;

drop trigger if exists on_organization_campuses_updated on public.organization_campuses;
create trigger on_organization_campuses_updated
  before update on public.organization_campuses
  for each row execute procedure public.handle_updated_at();

alter table public.organization_campuses enable row level security;

drop policy if exists "Platform admins manage organization_campuses" on public.organization_campuses;
create policy "Platform admins manage organization_campuses"
  on public.organization_campuses for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org admins manage organization_campuses" on public.organization_campuses;
create policy "Org admins manage organization_campuses"
  on public.organization_campuses for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
