-- Product foundation: families
-- Run after: add_product_organizations.sql

create table if not exists public.families (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  primary_email    text,
  primary_phone    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists families_organization_id_idx
  on public.families (organization_id);

drop trigger if exists on_families_updated on public.families;
create trigger on_families_updated
  before update on public.families
  for each row execute procedure public.handle_updated_at();
