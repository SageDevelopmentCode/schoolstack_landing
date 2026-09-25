-- Mark orphaned pending tuition payments as failed.
-- Paste into Supabase SQL Editor. Safe to re-run (idempotent).
-- Date: 2026-09-24
--
-- Why: tuition checkout used to insert a pending application_payments row before
-- creating the Stripe Checkout session. When Stripe rejected the session (e.g.
-- "No such destination" for the Demo school's test-mode account on the live key),
-- the row stayed pending forever with no session or payment intent. The checkout
-- routes now mark these failed automatically; this cleans up the existing rows.
--
-- As of 2026-09-24 this matches 2 rows (both rooted-meadows-demo):
--   8194852d-235e-4981-9348-3ea8fc6e9f37, 6e6f8681-2238-413a-a332-276bc5405f9a

-- ── Step 1: Preview ──────────────────────────────────────────────────────────

select p.id, o.slug, p.label, p.amount_cents, p.created_at
from public.application_payments p
join public.organizations o on o.id = p.organization_id
where p.payment_type = 'tuition'
  and p.status = 'pending'
  and p.stripe_checkout_session_id is null
  and p.stripe_payment_intent_id is null
  and p.created_at < now() - interval '1 hour'
order by p.created_at desc;

-- ── Step 2: Mark failed ──────────────────────────────────────────────────────

update public.application_payments
set status = 'failed'
where payment_type = 'tuition'
  and status = 'pending'
  and stripe_checkout_session_id is null
  and stripe_payment_intent_id is null
  and created_at < now() - interval '1 hour';
