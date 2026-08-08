-- Rooted Meadows build log: August 5, 2026 — Teacher portal foundation
-- Run in Supabase SQL Editor on remote. Safe to re-run (idempotent).

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
  '2026-08-05'::date,
  '05',
  'Teacher portal',
  'Teacher portal opens — staff tools and one login for every portal',
  $summary$We started Phase 5 by giving your guides their own portal and making staff management easier for admins. Teachers now sign in to a dedicated dashboard with quick links to their tools. On the Staff page, you can update a team member's name, job title, portal role, and employment status, and copy a shareable teacher login link. If someone has access to more than one portal, the profile menu switcher now includes the teacher portal alongside school admin and family views. Page transitions are also smoother when switching between portals or previewing as another user.$summary$,
  $highlights$[
    "Teacher portal dashboard — guides land on a home screen with quick links to their tools",
    "Teacher sign-in — staff with teacher access are routed to the teacher portal after login",
    "Staff profile editing — update name, title, portal role, and active/inactive status from the Staff page",
    "Copyable teacher login link — share the school's teacher sign-in URL directly from a staff record",
    "Portal switcher — jump between school admin, teacher, and family views when you have access",
    "Smoother portal navigation — less flicker when switching portals or using admin preview"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
