-- Promoted to supabase/migrations/20261010_restrict_classroom_signup_response_guardian_writes.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Purpose: close PostgREST bypass where guardians could INSERT/UPDATE signup responses with only family_id checks.

drop policy if exists "Guardians manage classroom_signup_responses for own family"
  on public.classroom_signup_responses;
