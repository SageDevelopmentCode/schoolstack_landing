-- Product foundation: programs
-- Run after: add_product_organizations.sql

create table if not exists public.programs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  name             text not null,
  type             text not null
                     check (type in ('school_year', 'summer', 'homeschool_drop_in')),
  status           text not null default 'draft'
                     check (status in ('draft', 'open', 'waitlist', 'full', 'closed')),
  start_date       date,
  end_date         date,
  capacity         int,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists programs_organization_id_idx
  on public.programs (organization_id);

create index if not exists programs_org_status_idx
  on public.programs (organization_id, status);

drop trigger if exists on_programs_updated on public.programs;
create trigger on_programs_updated
  before update on public.programs
  for each row execute procedure public.handle_updated_at();
