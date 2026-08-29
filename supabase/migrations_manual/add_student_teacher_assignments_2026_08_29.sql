-- Promoted to supabase/migrations/20260831_add_student_teacher_assignments.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create table if not exists public.student_teacher_assignments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  staff_member_id  uuid not null references public.staff_members(id) on delete cascade,
  created_at       timestamptz not null default now(),

  unique (student_id, staff_member_id)
);

create index if not exists student_teacher_assignments_staff_member_id_idx
  on public.student_teacher_assignments (staff_member_id);

create index if not exists student_teacher_assignments_org_student_idx
  on public.student_teacher_assignments (organization_id, student_id);

insert into public.student_teacher_assignments (organization_id, student_id, staff_member_id)
select s.organization_id, s.id, s.assigned_teacher_id
from public.students s
where s.assigned_teacher_id is not null
on conflict (student_id, staff_member_id) do nothing;

drop index if exists public.students_assigned_teacher_id_idx;

alter table public.students
  drop column if exists assigned_teacher_id;

alter table public.student_teacher_assignments enable row level security;

drop policy if exists "Platform admins manage student_teacher_assignments" on public.student_teacher_assignments;
create policy "Platform admins manage student_teacher_assignments"
  on public.student_teacher_assignments
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org members read student_teacher_assignments" on public.student_teacher_assignments;
create policy "Org members read student_teacher_assignments"
  on public.student_teacher_assignments
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

drop policy if exists "Org admins manage student_teacher_assignments" on public.student_teacher_assignments;
create policy "Org admins manage student_teacher_assignments"
  on public.student_teacher_assignments
  for all
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
