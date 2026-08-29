-- Many-to-many student ↔ teacher assignments (replaces students.assigned_teacher_id)
-- Run after: 20260827_add_application_draft_reminder_sent_at.sql

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

-- Backfill from legacy single-teacher column
insert into public.student_teacher_assignments (organization_id, student_id, staff_member_id)
select s.organization_id, s.id, s.assigned_teacher_id
from public.students s
where s.assigned_teacher_id is not null
on conflict (student_id, staff_member_id) do nothing;

drop index if exists public.students_assigned_teacher_id_idx;

alter table public.students
  drop column if exists assigned_teacher_id;

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.student_teacher_assignments enable row level security;

create policy "Platform admins manage student_teacher_assignments"
  on public.student_teacher_assignments
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read student_teacher_assignments"
  on public.student_teacher_assignments
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage student_teacher_assignments"
  on public.student_teacher_assignments
  for all
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
