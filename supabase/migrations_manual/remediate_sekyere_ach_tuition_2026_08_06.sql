-- Manual remediation if an ACH tuition payment fails after being marked paid early.
-- Paste into Supabase SQL Editor only when Stripe reports async_payment_failed.
-- Review payment_id / charge_id for the specific family before running.

-- Example identifiers from Sekyere / Georgie Aug 2026 incident (replace if different):
-- payment_id: 7a5fa4d2-efdf-4e95-ac68-5a5d4f07bd74
-- tuition_charge_id: 01341d14-bdd1-4848-8669-ac851547bfb9

-- begin;

-- update application_payments
-- set status = 'failed', paid_at = null
-- where id = '7a5fa4d2-efdf-4e95-ac68-5a5d4f07bd74'
--   and status = 'succeeded';

-- update tuition_charges
-- set status = 'sent', paid_at = null, paid_cents = 0
-- where id = '01341d14-bdd1-4848-8669-ac851547bfb9'
--   and status = 'paid';

-- Mark abandoned Olivia checkout attempts as failed (optional cleanup):
-- update application_payments
-- set status = 'failed'
-- where id in (
--   'f438353d-2e10-40ef-b941-3ee1877ab6f6',
--   'b4fa91d1-da16-498c-b622-70ec375a5fe3'
-- ) and status = 'pending';

-- Restore Candace default Link card after webhook unset it (optional):
update family_payment_methods
set is_default = true
where stripe_payment_method_id = 'pm_1U1Jj2JPlPJpPJRqotOTeyQ4';

-- commit;
