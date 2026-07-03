-- Product admissions: applications and application files
-- Run after: add_product_application_form_versions.sql, add_product_families.sql,
--            add_product_guardians.sql, add_product_students.sql

create table if not exists public.applications (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  program_id            uuid not null references public.programs(id) on delete restrict,
  form_version_id       uuid not null references public.application_form_versions(id) on delete restrict,
  family_id             uuid references public.families(id) on delete set null,
  student_id            uuid references public.students(id) on delete set null,
  primary_guardian_id   uuid references public.guardians(id) on delete set null,
  status                text not null default 'draft'
                          check (status in (
                            'draft',
                            'submitted',
                            'fee_pending',
                            'under_review',
                            'observation',
                            'accepted',
                            'declined',
                            'withdrawn'
                          )),
  responses             jsonb not null default '{}'::jsonb,
  acknowledgments       jsonb not null default '{}'::jsonb,
  fee_status            text not null default 'not_required'
                          check (fee_status in ('not_required', 'pending', 'paid', 'waived')),
  fee_paid_at           timestamptz,
  submitted_at          timestamptz,
  access_token          uuid not null default gen_random_uuid(),
  created_by_user_id    uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists applications_organization_id_idx
  on public.applications (organization_id);

create index if not exists applications_org_status_idx
  on public.applications (organization_id, status);

create index if not exists applications_program_id_idx
  on public.applications (program_id);

create index if not exists applications_form_version_id_idx
  on public.applications (form_version_id);

create index if not exists applications_family_id_idx
  on public.applications (family_id)
  where family_id is not null;

create index if not exists applications_student_id_idx
  on public.applications (student_id)
  where student_id is not null;

create unique index if not exists applications_access_token_key
  on public.applications (access_token);

drop trigger if exists on_applications_updated on public.applications;
create trigger on_applications_updated
  before update on public.applications
  for each row execute procedure public.handle_updated_at();

-- ── application_files ─────────────────────────────────────────────────────────

create table if not exists public.application_files (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  application_id        uuid not null references public.applications(id) on delete cascade,
  field_id              text not null,
  file_name             text not null,
  storage_path          text not null,
  mime_type             text,
  size_bytes            bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by_user_id   uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now()
);

create index if not exists application_files_organization_id_idx
  on public.application_files (organization_id);

create index if not exists application_files_application_id_idx
  on public.application_files (application_id);

create index if not exists application_files_app_field_idx
  on public.application_files (application_id, field_id);
