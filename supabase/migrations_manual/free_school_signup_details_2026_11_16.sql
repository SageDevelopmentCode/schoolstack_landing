-- Promoted to supabase/migrations/20261166_free_school_signup_details.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Optional details collected on the /try free-school signup: the founder's
-- first name plus the same role and student count values demo_requests stores.
-- Written only by /api/try/complete with the service role; no public access.
-- Run after: 20261165_application_payments_canceled_status.sql

create table if not exists public.free_school_signup_details (
  organization_id uuid primary key
    references public.organizations (id) on delete cascade,
  user_id uuid,
  first_name text not null,
  role text
    check (role in ('starting', 'running', 'program', 'other')),
  student_count text
    check (student_count in ('0-10', '11-25', '26-75', '76+')),
  created_at timestamptz not null default now()
);

comment on table public.free_school_signup_details is
  'Optional founder details captured on the /try free-school signup.';

alter table public.free_school_signup_details enable row level security;

revoke all on table public.free_school_signup_details from public, anon, authenticated;
grant all on table public.free_school_signup_details to service_role;