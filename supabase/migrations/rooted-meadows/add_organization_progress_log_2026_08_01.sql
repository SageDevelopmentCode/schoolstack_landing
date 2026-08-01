-- Organization progress log: August 1, 2026 — Phase 04 Committees (Rooted Meadows)
-- Run after: add_product_organization_progress_log.sql (or add_product_timeline_bootstrap.sql)

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
  '2026-08-01'::date,
  '04',
  'Committees',
  'Committee workspaces go live — join requests, duty roles, and billing polish',
  $summary$We kicked off Phase 4: Committees. Parents can now browse open committees, request to join, and work inside a dedicated committee workspace once approved. Your team can review join requests, manage duty roles with assigned members, upload planning files, and use a richer committee calendar. We also tightened billing: the tuition family view is organized into clear sections, parents can pay a custom amount toward a charge, late fees respect split billing between guardians, and your activity feed now shows clearer tuition payment context.$summary$,
  $highlights$[
    "Parent committee browse — families see open committees and request to join",
    "Admin join request review — approve or decline with a role assignment",
    "Parent committee workspace — resources, calendar, tasks, and messages after approval",
    "Duty roles — add, edit, assign members, and remove roles from the About section",
    "Committee file uploads — attach PDF and Word docs to resources",
    "Committee calendar improvements — event detail panel and clearer scheduling",
    "Staff directory — manage staff records from admin (early groundwork for the teacher portal)",
    "Tuition family sections — Assignments, Balance, Autopay, Schedule, and Payments in one place",
    "Partial tuition payments — parents can pay a custom amount toward a charge",
    "Late fee notices and split-billing late fees — clearer parent messaging when fees apply per guardian",
    "Tuition payment notifications — activity feed shows family and student context",
    "Autopay retry improvements — more reliable automatic payment runs"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
