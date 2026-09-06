-- Olivia Sekyere Aug 2026 tuition — ACH microdeposit verification timed out.
-- Date: 2026-09-05
-- Stripe PI pi_3U1K33JPlPJpPJRq0sHLJoXU: requires_payment_method, amount_received=0
-- Georgie (01341d14) and Claire (97159312) payments are fine — do NOT touch.
--
-- Paste into Supabase SQL Editor. Review IDs before running.

begin;

-- Revert phantom succeeded payment
update application_payments
set status = 'failed',
    paid_at = null,
    stripe_provider_status = 'failed'
where id = 'b4fa91d1-da16-498c-b622-70ec375a5fe3'
  and status = 'succeeded';

-- Reopen Olivia's August charge so checkout works again
update tuition_charges
set status = 'sent',
    paid_at = null,
    paid_cents = 0
where id = '8b58ec9c-53fc-487b-815a-47a1b81dbc38'
  and status = 'paid';

-- Clean up abandoned pending attempt for same charge
update application_payments
set status = 'failed'
where id = 'f438353d-2e10-40ef-b941-3ee1877ab6f6'
  and status = 'pending';

commit;

-- Verify after running:
-- select id, status, paid_cents from tuition_charges where id = '8b58ec9c-53fc-487b-815a-47a1b81dbc38';
-- select id, status, stripe_provider_status from application_payments where id = 'b4fa91d1-da16-498c-b622-70ec375a5fe3';
