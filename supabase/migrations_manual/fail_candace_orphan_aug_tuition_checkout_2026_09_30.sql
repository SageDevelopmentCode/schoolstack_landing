-- 2026-09-30: Fail orphan pending tuition checkout for Candace Sekyere (Claire Aug).
-- Stripe session cs_live_a1VPcmU… is expired; succeeded payment 6dfbd46a… exists for the same charge.
-- Run in Supabase SQL Editor after verifying rows still match.

update application_payments
set
  status = 'failed',
  stripe_provider_status = 'failed'
where id = '2ebaa10b-74c5-42b1-8279-cd481b7f0a63'
  and family_id = 'a2b3c4d5-e6f7-4890-a123-456789abcdef'
  and status = 'pending'
  and stripe_checkout_session_id =
    'cs_live_a1VPcmUtnvhEtfSmJizczBPA3I1fOJUshSxJfTDcqcc2HYRPdMvykMSpLE';
