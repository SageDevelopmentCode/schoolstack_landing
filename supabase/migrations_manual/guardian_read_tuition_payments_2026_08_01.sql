-- Promoted to supabase/migrations/20260803_guardian_read_tuition_payments.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
--
-- Fixes parent portal payment history: tuition payments use family_id (not application_id),
-- so guardians could see paid charges but not matching payment rows.

create policy "Guardians can read own tuition application_payments"
  on public.application_payments
  for select
  to authenticated
  using (
    family_id is not null
    and payment_type = 'tuition'
    and public.user_is_guardian_for_family(family_id)
  );
