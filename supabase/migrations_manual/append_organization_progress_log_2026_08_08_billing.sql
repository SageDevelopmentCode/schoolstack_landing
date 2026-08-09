-- Rooted Meadows build log: August 8, 2026 — append afternoon billing work
-- Run in Supabase SQL Editor after add_organization_progress_log_2026_08_08.sql
-- One-time update (re-running will duplicate the appended text).

update public.organization_progress_log l
set
  title = 'Student roster, teacher assignments, and tuition payment receipts',
  summary = l.summary || $append$

Later that afternoon we pushed tuition billing forward. Families can now apply a tax credit, bonus, or lump sum toward tuition — with a live preview of how the extra amount pays ahead and recalculates remaining installments. After each payment, parents get an email receipt and can open a detailed receipt from their payment history, including per-child line items and lump-sum breakdowns. School admins can record manual payments (checks, cash, or transfers) from the tuition families panel, and checkout sessions now show clearer per-student charge details for single and combined payments.
$append$,
  highlights = l.highlights || $billing$[
    "Tax credit and lump-sum payments — families pay ahead and future installments recalculate automatically",
    "Pay-ahead schedule preview — see how extra payments reduce remaining installments before checkout",
    "Payment receipt panel — parents open itemized receipts from billing payment history",
    "Payment receipt emails — families receive a receipt after Stripe checkout, autopay, or manual payments",
    "Manual payment recording — admins log checks, cash, or bank transfers against a charge from tuition families",
    "Checkout line items by student — clearer Stripe summaries for single and combined tuition payments",
    "Payment history improvements — tuition and enrollment payments show method labels and open receipt details"
  ]$billing$::jsonb
from public.organizations o
where l.organization_id = o.id
  and o.slug in ('rooted-meadows-school', 'rooted-meadows')
  and l.entry_date = '2026-08-08'::date;
