-- Product foundation: classrooms
-- Run after: add_product_programs.sql

create table if not exists public.classrooms (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  program_id       uuid references public.programs(id) on delete set null,
  name             text not null,
  status           text not null default 'open'
                     check (status in ('open', 'full', 'inactive')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists classrooms_organization_id_idx
  on public.classrooms (organization_id);

create index if not exists classrooms_program_id_idx
  on public.classrooms (program_id);

drop trigger if exists on_classrooms_updated on public.classrooms;
create trigger on_classrooms_updated
  before update on public.classrooms
  for each row execute procedure public.handle_updated_at();
