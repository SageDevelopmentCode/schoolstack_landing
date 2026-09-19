-- Restrict classroom signup response guardian writes to SELECT only.
-- Parent mutations go through API routes using service_role.
-- Run after: 20261009_restrict_friday_branch_enrollment_guardian_writes.sql

drop policy if exists "Guardians manage classroom_signup_responses for own family"
  on public.classroom_signup_responses;
