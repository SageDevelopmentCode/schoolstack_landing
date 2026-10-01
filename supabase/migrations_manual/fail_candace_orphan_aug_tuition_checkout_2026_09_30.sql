-- 2026-09-30: Fail orphan pending tuition checkout for Candace Sekyere (Claire Aug).
-- Stripe session cs_live_a1VPcmU… is expired; succeeded payment 6dfbd46a… exists for the same charge.
-- Set v_checkout_session_id below from Workbench before running. Do not commit full live session ids.
-- Run in Supabase SQL Editor after verifying rows still match.

do $$
declare
  v_checkout_session_id text := '<paste cs_live_… from Workbench>';
begin
  if v_checkout_session_id = '<paste cs_live_… from Workbench>' then
    raise exception 'Set v_checkout_session_id from Stripe Workbench before running';
  end if;

  update application_payments
  set
    status = 'failed',
    stripe_provider_status = 'failed'
  where id = '2ebaa10b-74c5-42b1-8279-cd481b7f0a63'
    and family_id = 'a2b3c4d5-e6f7-4890-a123-456789abcdef'
    and status = 'pending'
    and stripe_checkout_session_id = v_checkout_session_id;

  if not found then
    raise notice 'No matching pending payment row — verify ids and session id before re-running.';
  end if;
end $$;
