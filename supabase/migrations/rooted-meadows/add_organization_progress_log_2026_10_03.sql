-- Organization progress log: October 3, 2026 — Bank payment verification and more co-op screens (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_01.sql

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
  '2026-10-03'::date,
  '07',
  'v1 launch prep',
  'Bank payment verification and more co-op screens',
  $summary$Bank (ACH) payments that need verification no longer look unpaid. Families get an email with a link to verify their bank, the school is told too, and billing shows the right status while a payment is processing. More of the co-op portal now works in the MudKitchen mobile app.$summary$,
  $highlights$[
    "Verify your bank email — families get a direct link, and admins are notified",
    "Honest payment status — Verify bank or Processing (usually 3–5 business days) instead of unpaid",
    "Co-op screens on mobile — Children, Committees, and Notification settings now work",
    "Reliable sign-in emails — magic links and sign-up confirmations always point to the live site"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
