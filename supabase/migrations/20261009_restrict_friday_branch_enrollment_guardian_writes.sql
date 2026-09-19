-- Restrict Friday Branch enrollment guardian writes to SELECT only.
-- Parent enroll/withdraw goes through service_role RPCs (enroll/withdraw_friday_branch_student_atomic).
-- Run after: 20261008_fix_friday_branch_time_conflict_race.sql

drop policy if exists "Guardians manage friday_branch_class_enrollments for own family"
  on public.friday_branch_class_enrollments;
