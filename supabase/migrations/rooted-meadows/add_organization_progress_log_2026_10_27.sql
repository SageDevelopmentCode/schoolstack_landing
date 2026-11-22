-- Organization progress log: October 27, 2026 — Photo and media permissions (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_25.sql

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
  '2026-10-27'::date,
  '07',
  'v1 launch prep',
  'Photo and media permissions',
  $summary$Parents can now set photo and media permission for each child as full, limited, or none, on the web and in the MudKitchen mobile app. Admins see these permissions next to Photos and on each student's record, and existing answers were carried over from enrollment forms. Newsletters gained an editions overview and can use photos from the school gallery.$summary$,
  $highlights$[
    "Per-child permissions — parents choose full, limited, or none",
    "Admin visibility — a permissions sidebar on Photos and a badge on each student record",
    "Carried over — answers from enrollment forms were filled in automatically",
    "Newsletter editions — an overview, a new edition dialog, and photos from the gallery",
    "Health and Pickup tabs — new tabs on the child record in the mobile app"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
