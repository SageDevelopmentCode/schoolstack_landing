-- Product admissions: application form versions
-- Run after: add_product_programs.sql

create table if not exists public.application_form_versions (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  program_id       uuid references public.programs(id) on delete set null,
  version          integer not null check (version > 0),
  status           text not null default 'draft'
                     check (status in ('draft', 'published', 'archived')),
  title            text not null,
  intro            text,
  schema           jsonb not null default '{}'::jsonb,
  fee_config       jsonb not null default '{}'::jsonb,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists application_form_versions_organization_id_idx
  on public.application_form_versions (organization_id);

create index if not exists application_form_versions_org_status_idx
  on public.application_form_versions (organization_id, status);

create index if not exists application_form_versions_program_id_idx
  on public.application_form_versions (program_id)
  where program_id is not null;

create unique index if not exists application_form_versions_org_program_version_key
  on public.application_form_versions (
    organization_id,
    coalesce(program_id, '00000000-0000-0000-0000-000000000000'::uuid),
    version
  );

drop trigger if exists on_application_form_versions_updated on public.application_form_versions;
create trigger on_application_form_versions_updated
  before update on public.application_form_versions
  for each row execute procedure public.handle_updated_at();
