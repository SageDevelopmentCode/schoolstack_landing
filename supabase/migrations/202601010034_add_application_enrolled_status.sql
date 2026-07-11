-- Add enrolled application status when enrollment checklist is complete
-- Run after: add_enrollment_checklist_variants.sql

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
    'enrolled',
    'declined',
    'withdrawn'
  ));

update public.applications a
set status = 'enrolled'
from public.enrollment_checklists ec
where a.id = ec.application_id
  and a.status = 'enrolling'
  and ec.status = 'completed';
