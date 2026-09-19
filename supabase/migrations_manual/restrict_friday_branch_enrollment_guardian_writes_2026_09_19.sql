-- Promoted to supabase/migrations/20261009_restrict_friday_branch_enrollment_guardian_writes.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Purpose: close PostgREST bypass where guardians could INSERT/UPDATE enrollments with only family_id checks.

drop policy if exists "Guardians manage friday_branch_class_enrollments for own family"
  on public.friday_branch_class_enrollments;
