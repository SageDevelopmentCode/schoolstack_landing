-- Allow guardians to read tuition payment records linked by family_id.
-- Run after: 20260802_add_committee_resource_files.sql

create policy "Guardians can read own tuition application_payments"
  on public.application_payments
  for select
  to authenticated
  using (
    family_id is not null
    and payment_type = 'tuition'
    and public.user_is_guardian_for_family(family_id)
  );
