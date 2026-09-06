-- Promoted to supabase/migrations/20260905_add_classroom_staff_assignments.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Purpose: staff-to-classroom assignments (lead / assistant) for My School Classrooms MVP.

create table if not exists public.classroom_staff_assignments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  classroom_id     uuid not null references public.classrooms(id) on delete cascade,
  staff_member_id  uuid not null references public.staff_members(id) on delete cascade,
  role             text not null default 'lead'
                     check (role in ('lead', 'assistant')),
  created_at       timestamptz not null default now(),

  unique (classroom_id, staff_member_id)
);

create index if not exists classroom_staff_assignments_organization_id_idx
  on public.classroom_staff_assignments (organization_id);

create index if not exists classroom_staff_assignments_classroom_id_idx
  on public.classroom_staff_assignments (classroom_id);

create index if not exists classroom_staff_assignments_staff_member_id_idx
  on public.classroom_staff_assignments (staff_member_id);

alter table public.classroom_staff_assignments enable row level security;

drop policy if exists "Platform admins manage classroom_staff_assignments"
  on public.classroom_staff_assignments;
create policy "Platform admins manage classroom_staff_assignments"
  on public.classroom_staff_assignments
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org members read classroom_staff_assignments"
  on public.classroom_staff_assignments;
create policy "Org members read classroom_staff_assignments"
  on public.classroom_staff_assignments
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

drop policy if exists "Org admins manage classroom_staff_assignments"
  on public.classroom_staff_assignments;
create policy "Org admins manage classroom_staff_assignments"
  on public.classroom_staff_assignments
  for all
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
