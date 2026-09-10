-- Rooted Meadows build logs: September 5–10, 2026 (6 entries)
-- Paste into Supabase SQL Editor after add_organization_progress_log_2026_09_04.sql
-- Idempotent — safe to re-run.

-- Organization progress log: September 5, 2026 — Bulletin polish, messages, committees (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_04.sql

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
  '2026-09-05'::date,
  '07',
  'v1 launch prep',
  'Bulletin attachments, messages polish, and committee descriptions',
  $summary$Families and staff can now open bulletin attachments without leaving the portal. We cleaned up parent and teacher home screens and made message threads more reliable when starting a conversation. When creating a committee, admins can add a short description so members know what the group is for.$summary$,
  $highlights$[
    "Bulletin attachments — preview images and files directly from school updates",
    "Cleaner home screens — parent and teacher dashboards are easier to scan",
    "Message thread fixes — starting a conversation is more reliable",
    "Committee descriptions — add context when creating a new committee"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 6, 2026 — Tuition autopay reliability (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_05.sql

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
  '2026-09-06'::date,
  '07',
  'v1 launch prep',
  'More reliable tuition autopay',
  $summary$We tightened how autopay matches guardians to billing records so scheduled payments run correctly for the right family member.$summary$,
  $highlights$[
    "Autopay guardian matching — payments charge the correct parent or guardian",
    "Billing reliability — fewer edge cases when a family has multiple guardians on file"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 7, 2026 — Admin dashboard and curriculum PDF viewer (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_06.sql

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
  '2026-09-07'::date,
  '07',
  'v1 launch prep',
  'Admin dashboard refresh and in-portal curriculum PDF viewer',
  $summary$The admin home screen now surfaces recent activity, payment history, and quick links to common tasks. Co-op families can read their program curriculum PDF right inside the portal, with a table of contents to jump to any section.$summary$,
  $highlights$[
    "Activity feed — see what's happening across admissions, billing, and portal activity",
    "Payment history — view recent tuition payments without opening each family",
    "Curriculum PDF viewer — read co-op guides in the browser with a clickable outline",
    "How-to guides on admin home — quick links to common admin tasks"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 8, 2026 — Multi-PDF curriculum and reading experience (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_07.sql

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
  '2026-09-08'::date,
  '07',
  'v1 launch prep',
  'Multiple curriculum documents and a clearer reading experience',
  $summary$Programs can now share more than one curriculum PDF, and families can switch between school-wide and co-op portal views without getting lost. The curriculum page adds a discussion panel alongside the document so parents can comment while they read.$summary$,
  $highlights$[
    "Multiple curriculum PDFs — upload and organize several guides per program",
    "Discussion alongside the document — comment in a sidebar while viewing the PDF",
    "Portal switcher — move between school and co-op portals more clearly",
    "Guide list — pick which curriculum document to open"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 9, 2026 — Co-op supply list and teaching schedule (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_08.sql

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
  '2026-09-09'::date,
  '07',
  'v1 launch prep',
  'Co-op supply list and parent teaching schedule',
  $summary$Co-op programs can publish a supply list where parents sign up to bring specific items — no more duplicate purchases or confusion about who is bringing what. Families can also view the teaching schedule and volunteer to lead a co-op day, with admins managing slots from the programs page.$summary$,
  $highlights$[
    "Supply list — parents claim items they will bring; see what's still needed",
    "Teaching schedule — view co-op days and sign up to teach or help",
    "Admin schedule tools — set up weeks, slots, and volunteer roles per program",
    "Bulletin on co-op home — recent school updates visible in the program portal"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 10, 2026 — Activity notifications, guides, charge waiving (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_09.sql

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
  '2026-09-10'::date,
  '07',
  'v1 launch prep',
  'Activity notifications, how-to guides, and tuition charge waiving',
  $summary$Parents now get a notification center that highlights new messages, bulletin posts, co-op signups, and other activity — so nothing important gets missed. We added a documentation section with searchable how-to guides for families. On the admin side, you can waive a tuition charge when a family should not be billed.$summary$,
  $highlights$[
    "Activity notifications — see what's new across messages, bulletin, and co-op updates",
    "Unread badges — know at a glance when something needs attention",
    "How-to guides — searchable help for parents in the portal",
    "Waive tuition charges — admins can remove a charge that should not apply"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
