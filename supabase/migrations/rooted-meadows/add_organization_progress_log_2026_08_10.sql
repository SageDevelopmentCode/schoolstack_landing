-- Organization progress log: August 10, 2026 — Family billing refresh (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_09.sql

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
  '2026-08-10'::date,
  '03',
  'Tuition & billing',
  'Refreshed family billing page',
  $summary$We reorganized the family billing page so tuition is easier to scan and pay. A sidebar separates your family summary from each child's tuition details, with balance, due dates, and Pay Now at the top. Families with multiple children can pay combined amounts when charges share the same due date. A banner on billing reminds families about applying Idaho Parent Choice Tax Credit toward tuition, and each child has a dedicated panel for their payment schedule, history, and autopay settings.$summary$,
  $highlights$[
    "Sidebar navigation — family summary plus a tab for each child",
    "Balance and pay now at the top — due dates, autopay status, and one-tap payment from the family header",
    "Per-child tuition panels — schedule, payment history, and settings for each student",
    "Combined payments — pay multiple children's charges together when they share the same due date",
    "Tax credit reminder — banner helps families apply Idaho Parent Choice Tax Credit toward tuition",
    "Clearer schedule status — badges when a payment plan still needs to be chosen"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
