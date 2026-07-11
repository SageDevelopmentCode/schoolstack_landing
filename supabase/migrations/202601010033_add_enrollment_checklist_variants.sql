-- Enrollment checklist variant groups: link checklists to applications, store resolutions

alter table public.enrollment_checklists
  add column if not exists application_id uuid references public.applications(id) on delete cascade,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists enrollment_checklists_application_id_key
  on public.enrollment_checklists (application_id)
  where application_id is not null;

create index if not exists enrollment_checklists_application_id_idx
  on public.enrollment_checklists (application_id)
  where application_id is not null;

-- Allow applications in "enrolling" status (checklist in progress)
alter table public.applications
  drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_status_check
  check (status in (
    'draft',
    'submitted',
    'fee_pending',
    'under_review',
    'observation',
    'accepted',
    'enrolling',
    'declined',
    'withdrawn'
  ));
