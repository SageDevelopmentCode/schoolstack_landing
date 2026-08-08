-- Promoted to supabase/migrations/20260805_add_student_assigned_teacher.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

alter table public.students
  add column if not exists assigned_teacher_id uuid
    references public.staff_members(id) on delete set null;

create index if not exists students_assigned_teacher_id_idx
  on public.students (assigned_teacher_id)
  where assigned_teacher_id is not null;
