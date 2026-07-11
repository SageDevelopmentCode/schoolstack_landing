-- Product admissions: fee definitions
-- Run after: add_product_programs.sql

create table if not exists public.fee_definitions (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  program_id       uuid references public.programs(id) on delete set null,
  code             text not null,
  label            text not null,
  amount_cents     integer not null check (amount_cents >= 0),
  currency         text not null default 'USD',
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists fee_definitions_organization_id_idx
  on public.fee_definitions (organization_id);

create index if not exists fee_definitions_program_id_idx
  on public.fee_definitions (program_id)
  where program_id is not null;

create unique index if not exists fee_definitions_org_code_active_key
  on public.fee_definitions (organization_id, code)
  where active = true;

drop trigger if exists on_fee_definitions_updated on public.fee_definitions;
create trigger on_fee_definitions_updated
  before update on public.fee_definitions
  for each row execute procedure public.handle_updated_at();
