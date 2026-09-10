-- Promoted to supabase/migrations/20260913_add_enrollment_classrooms.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Many-to-many enrollment ↔ classroom assignments (multiple classrooms per program enrollment)

create table if not exists public.enrollment_classrooms (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  enrollment_id    uuid not null references public.enrollments(id) on delete cascade,
  classroom_id     uuid not null references public.classrooms(id) on delete cascade,
  created_at       timestamptz not null default now(),

  unique (enrollment_id, classroom_id)
);

create index if not exists enrollment_classrooms_organization_id_idx
  on public.enrollment_classrooms (organization_id);

create index if not exists enrollment_classrooms_enrollment_id_idx
  on public.enrollment_classrooms (enrollment_id);

create index if not exists enrollment_classrooms_classroom_id_idx
  on public.enrollment_classrooms (classroom_id);

create index if not exists enrollment_classrooms_org_classroom_idx
  on public.enrollment_classrooms (organization_id, classroom_id);

insert into public.enrollment_classrooms (organization_id, enrollment_id, classroom_id)
select organization_id, id, classroom_id
from public.enrollments
where classroom_id is not null
on conflict (enrollment_id, classroom_id) do nothing;

alter table public.enrollment_classrooms enable row level security;

create policy "Platform admins manage enrollment_classrooms"
  on public.enrollment_classrooms
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read enrollment_classrooms"
  on public.enrollment_classrooms
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage enrollment_classrooms"
  on public.enrollment_classrooms
  for all
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
