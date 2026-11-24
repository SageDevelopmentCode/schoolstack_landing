-- Organization progress log: September 28, 2026 — Public campus tours and linked portal accounts (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_27.sql

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
  '2026-09-28'::date,
  '07',
  'v1 launch prep',
  'Public campus tours and linked portal accounts',
  $summary$Prospective families can now book a campus tour from a public page without starting an application, including group tours with a set capacity. Admins manage tours from a new Tours & Interviews tab, and families get confirmation and reminder emails. People who are both a parent and staff member can switch portals from the header.$summary$,
  $highlights$[
    "Public tour page — families book a campus tour and get a confirmation email",
    "Tours & Interviews tab — set up the tour page and see every booking in Schedule",
    "Visit reminders — families are reminded the day before, and admins get a digest of upcoming visits",
    "Portal switcher — linked accounts move between admin, parent, and teacher portals in one click",
    "Unread reminders — a nudge email when messages have gone unread"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
