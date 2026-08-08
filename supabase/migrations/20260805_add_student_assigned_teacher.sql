-- Product foundation: assign a primary teacher to each student
-- Run after: 20260804_fix_family_payment_methods_guardian_upsert.sql

alter table public.students
  add column if not exists assigned_teacher_id uuid
    references public.staff_members(id) on delete set null;

create index if not exists students_assigned_teacher_id_idx
  on public.students (assigned_teacher_id)
  where assigned_teacher_id is not null;
