-- Organization progress log: October 1, 2026 — Autopay with saved payment methods (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_30.sql

insert into public.organization_progress_log (
  organization_id,
  entry_date,
  phase_number,
  phase_title,
  title,
  summary,
  highlights
)
select
  o.id,
  '2026-10-01'::date,
  '07',
  'v1 launch prep',
  'Autopay with saved payment methods',
  $summary$A card or bank account saved during checkout can now be used for autopay, so families only enter payment details once. Families get a receipt each time autopay runs. Committee members also get an email when their workspace has unread activity.$summary$,
  $highlights$[
    "Saved methods for autopay — the card or bank saved at checkout covers future charges",
    "Autopay receipts — amount, processing fee, payment method, and date in every receipt",
    "Committee activity emails — a heads-up when a committee has unread activity",
    "Unread counts — committee unread counts on the parent Committees page"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
