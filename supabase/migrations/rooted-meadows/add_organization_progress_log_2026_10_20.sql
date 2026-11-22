-- Organization progress log: October 20, 2026 — Admissions next steps and MudKitchen Support in Messages (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_19.sql

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
  '2026-10-20'::date,
  '07',
  'v1 launch prep',
  'Admissions next steps and MudKitchen Support in Messages',
  $summary$Admins can mark an applicant's next step complete with private staff notes and files, and a new Family portal access tab shows each family's portal setup. Newsletters, Committees, and Messages now sit together under Communication. Parents and teachers have a pinned MudKitchen Support conversation for direct help, and the academic history step was restored to the Rooted Meadows application.$summary$,
  $highlights$[
    "Next steps with staff notes — complete a step with private notes and attachments families never see",
    "Communication section — Newsletters, Committees, and Messages grouped in the sidebar",
    "MudKitchen Support conversation — parents and teachers message our team directly, privately",
    "Safer form editing — an out-of-date browser tab can no longer overwrite newer application changes",
    "Photo emails and saved drafts — families hear about new photos, and unsent messages are kept"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
