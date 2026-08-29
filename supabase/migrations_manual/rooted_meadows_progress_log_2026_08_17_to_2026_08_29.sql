-- Rooted Meadows build logs: August 17–29, 2026 (8 entries)
-- Paste into Supabase SQL Editor after add_organization_progress_log_2026_08_16.sql
-- Idempotent — safe to re-run.

-- Organization progress log: August 17, 2026 — Mobile app launch (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_16.sql

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
  '2026-08-17'::date,
  '06',
  'Mobile app',
  'MudKitchen mobile app — sign in on your phone',
  $summary$We started the Rooted Meadows mobile app for iOS and Android. Families and school staff can download the app, walk through a short intro, pick their school, and sign in with the same secure email link you use on the web. After login, the app sends you to the right place — family portal or school admin — so phone access matches what you already have in the browser.$summary$,
  $highlights$[
    "Mobile app for iOS and Android — school-branded MudKitchen app",
    "Secure sign-in — same magic-link email login as the web portals",
    "School picker — choose Rooted Meadows after install",
    "Smart routing — lands on family or school admin based on your role",
    "Foundation for upcoming parent and admin features on mobile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
-- Organization progress log: August 20, 2026 — School admin mobile (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_17.sql

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
  '2026-08-20'::date,
  '06',
  'Mobile app',
  'School admin mobile — review applications and students on the go',
  $summary$School admins can now handle admissions from their phone. The mobile app includes a dashboard, a searchable list of application submissions, and a full detail view for each family — status, form answers, enrollment checklist progress, and payments. You can also browse enrolled students, open a child's profile, and assign their primary teacher without opening a laptop.$summary$,
  $highlights$[
    "Admin dashboard on mobile — quick entry to admissions and students",
    "Application submissions list — filter and search from your phone",
    "Full submission detail — review answers, change status, and see enrollment progress",
    "Enrolled students list — tap any child for family and program info",
    "Assign a teacher — set a student's guide right from the mobile student profile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
-- Organization progress log: August 21, 2026 — Billing accuracy (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_20.sql

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
  '2026-08-21'::date,
  '03',
  'Tuition & billing',
  'Tuition billing accuracy improvements',
  $summary$We fixed several behind-the-scenes billing issues that could affect family balances — especially for split-billing households and late fees. Charges and payments should now settle more reliably, and duplicate late fees are prevented when multiple guardians share tuition.$summary$,
  $highlights$[
    "More reliable payment settlement — payments apply to the right charges",
    "Late fee fixes — avoids duplicate late fees on split-billing accounts",
    "Stronger charge generation — edge cases in rate plans handled correctly"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
-- Organization progress log: August 22, 2026 — School admin mobile expansion (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_21.sql

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
  '2026-08-22'::date,
  '06',
  'Mobile app',
  'School admin mobile — messages, staff, schedule, and payments',
  $summary$The school admin mobile app gained the tools you reach for most during the day. Admins can read and send portal messages, review tuition transactions, browse and edit staff records, and manage the admissions schedule — tours, shadow days, and school events — all from the phone app.$summary$,
  $highlights$[
    "Messages inbox — read and reply to family and staff conversations on mobile",
    "Start new conversations — reach a family or colleague without opening a laptop",
    "Tuition transactions — see recent payments and charges with filters",
    "Staff directory — view team members, roles, and assigned students",
    "Admissions schedule — manage tours, shadow days, and calendar events on the go"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
-- Organization progress log: August 23, 2026 — Parent mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_22.sql

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
  '2026-08-23'::date,
  '06',
  'Mobile app',
  'Parent mobile app — home, billing, messages, and children',
  $summary$Families now have a full parent experience in the mobile app. The home screen surfaces what needs attention — balances, messages, and enrollment updates. Parents can pay tuition and view receipts, read and send messages with the school, check the school calendar, and open each child's profile to work through enrollment checklist items or update a profile photo.$summary$,
  $highlights$[
    "Parent home screen — balances, alerts, and quick links at a glance",
    "Pay tuition on mobile — view charges, pay now, and open payment receipts",
    "Messages — family inbox with real-time threads, same as the web portal",
    "School calendar — upcoming events in week or month view",
    "My Children — each child's profile, checklist steps, and profile photo"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
-- Organization progress log: August 24, 2026 — Mobile polish + portal help (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_23.sql

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
  '2026-08-24'::date,
  '07',
  'v1 launch prep',
  'Mobile polish and Need Help button in every portal',
  $summary$We refined the mobile app navigation with a floating tab bar, smoother screen transitions, and account settings including notification preferences. We also added a Need Help? button to the apply form, parent portal, and school admin — families and staff can send a quick support message without hunting for a contact email.$summary$,
  $highlights$[
    "Floating tab bar on mobile — easier thumb navigation between main sections",
    "Account and notification settings — manage preferences from the More menu",
    "Smoother animations — less jank when moving between screens",
    "Need Help? button — available on apply, parent, and admin portals",
    "One-tap support requests — sends your message and current page to the MudKitchen team"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
-- Organization progress log: August 26, 2026 — Schedule availability (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_24.sql

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
  '2026-08-26'::date,
  '01',
  'Admissions',
  'Clearer tour and observation day scheduling',
  $summary$We improved how your team sets and reads admissions availability. The schedule calendar now uses a clear legend — which days are open, which already have a booking, and which are blocked — on both the web admin and the mobile schedule. Editing tour slots and observation-day availability is simpler and less error-prone.$summary$,
  $highlights$[
    "Calendar legend — open days, booked days, and blocked days at a glance",
    "Improved month view — easier to scan availability across weeks",
    "Tour availability editor — clearer controls for setting open slots",
    "Observation day availability — same improvements for shadow visits",
    "Matches on mobile — school admin schedule uses the same visual language"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
-- Organization progress log: August 29, 2026 — Teachers, reminders, admissions (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_26.sql

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
  '2026-08-29'::date,
  '05',
  'Teacher portal',
  'Multiple teachers per student, draft reminders, and clearer admissions queue',
  $summary$Students can now have more than one assigned guide — useful when co-teaching or covering specialties. School admins assign teachers from an improved picker on web and mobile, and parents see all assigned teachers on each child's profile. Families who start but don't finish an application get a friendly reminder email after a day or two. On the admissions submissions page, applications that still need your attention are highlighted so nothing sits unnoticed.$summary$,
  $highlights$[
    "Multiple teachers per student — assign more than one guide to a child",
    "Improved assignment picker — search and select teachers on web and mobile",
    "Parents see assigned teachers — new Teachers tab on each child's profile",
    "Draft application reminders — automatic email nudge for unfinished applications",
    "Action-needed highlighting — submitted and in-review applications stand out in the admin list"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
