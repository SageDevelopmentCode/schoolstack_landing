-- Product foundation: organizations (tenant root)
-- Run after: existing CRM migrations (requires public.handle_updated_at)

create table if not exists public.organizations (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null,
  name            text not null,
  status          text not null default 'onboarding'
                    check (status in ('onboarding', 'live', 'paused', 'churned')),
  timezone        text not null default 'America/Chicago',
  crm_school_id   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint organizations_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists organizations_slug_key
  on public.organizations (slug);

create index if not exists organizations_status_idx
  on public.organizations (status);

drop trigger if exists on_organizations_updated on public.organizations;
create trigger on_organizations_updated
  before update on public.organizations
  for each row execute procedure public.handle_updated_at();
