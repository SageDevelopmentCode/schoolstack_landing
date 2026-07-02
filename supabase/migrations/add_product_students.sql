-- Product foundation: students
-- Run after: add_product_families.sql

create table if not exists public.students (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  family_id        uuid not null references public.families(id) on delete cascade,
  first_name       text not null,
  last_name        text not null,
  date_of_birth    date,
  grade            text,
  status           text not null default 'active'
                     check (status in ('prospect', 'active', 'inactive', 'alumni')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists students_organization_id_idx
  on public.students (organization_id);

create index if not exists students_family_id_idx
  on public.students (family_id);

create index if not exists students_org_status_idx
  on public.students (organization_id, status);

drop trigger if exists on_students_updated on public.students;
create trigger on_students_updated
  before update on public.students
  for each row execute procedure public.handle_updated_at();
