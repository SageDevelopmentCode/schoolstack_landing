-- Product foundation: organization_settings (per-school branding and feature flags)
-- Run after: add_product_organizations.sql

create table if not exists public.organization_settings (
  organization_id  uuid primary key references public.organizations(id) on delete cascade,
  branding         jsonb not null default '{}'::jsonb,
  features         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists on_organization_settings_updated on public.organization_settings;
create trigger on_organization_settings_updated
  before update on public.organization_settings
  for each row execute procedure public.handle_updated_at();
