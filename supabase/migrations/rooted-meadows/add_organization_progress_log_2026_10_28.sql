-- Organization progress log: October 28, 2026 — New push notifications for families and teachers (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_27.sql

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
  '2026-10-28'::date,
  '07',
  'v1 launch prep',
  'New push notifications for families and teachers',
  $summary$The MudKitchen mobile app now sends parents a notification when their child is checked in, when pickup is recorded, when new school photos are posted, and when a bulletin post goes out. Teachers get bulletin notifications too. Links in messages and bulletin posts are now tappable, and visit emails include map links.$summary$,
  $highlights$[
    "Check-in and pickup alerts — parents know when their child arrives and is picked up",
    "Photo and bulletin alerts — a notification when new photos or posts are shared",
    "Teacher bulletin alerts — staff are notified about new posts",
    "Tappable links — links in messages and bulletin posts open on web and mobile",
    "Map links — visit emails include Google and Apple Maps directions"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
