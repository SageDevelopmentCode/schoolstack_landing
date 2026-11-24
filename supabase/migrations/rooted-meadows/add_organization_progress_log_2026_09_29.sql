-- Organization progress log: September 29, 2026 — Bulletin emails and autopay reminders (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_28.sql

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
  '2026-09-29'::date,
  '07',
  'v1 launch prep',
  'Bulletin emails and autopay reminders',
  $summary$When a bulletin post is published, including scheduled posts, the families and staff it targets now get a short email about it. Families also get a reminder before autopay charges them. Non-essential emails now include an unsubscribe link, while receipts and payment notices always go out.$summary$,
  $highlights$[
    "Announcement emails — each bulletin post is emailed once to its audience with a short excerpt",
    "Autopay reminders — families hear before an autopay charge runs",
    "Unsubscribe link — families can opt out of non-essential emails; billing emails always arrive"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
