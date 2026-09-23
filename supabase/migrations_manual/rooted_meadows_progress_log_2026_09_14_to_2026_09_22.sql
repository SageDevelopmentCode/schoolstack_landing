-- Rooted Meadows build logs: September 14–22, 2026 (9 entries)
-- Paste into Supabase SQL Editor after add_organization_progress_log_2026_09_13.sql
-- Idempotent — safe to re-run.

-- Organization progress log: September 14, 2026 — Committees, school bulletin, and mobile admin tools (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_13.sql

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
  '2026-09-14'::date,
  '07',
  'v1 launch prep',
  'Committees, school bulletin, and mobile admin tools',
  $summary$School admins can set up parent committees and publish school bulletin posts from the MudKitchen mobile app. Parents can browse committees and request to join from their phone, respond to classroom volunteer sign-ups, and choose which email addresses receive school notifications.$summary$,
  $highlights$[
    "Committee hub — admins create committees on the web; parents browse and request to join from mobile",
    "School bulletin on mobile — admins write and publish posts from the app",
    "Staff roster on mobile — browse team members and portal login status",
    "Notification email preferences — parents pick which addresses get school emails",
    "Classroom volunteer sign-ups — parents respond to teacher requests from mobile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 15, 2026 — Parent broadcasts, forms hub, and teacher mobile portal (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_14.sql

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
  '2026-09-15'::date,
  '07',
  'v1 launch prep',
  'Parent broadcasts, forms hub, and teacher mobile portal',
  $summary$Admins can send targeted messages to groups of parents — by program, classroom, grade, or hand-picked families — and each family receives it as their own private thread. A new forms workspace tracks every parent form across the school. Teachers get a full MudKitchen mobile portal with classroom rosters, calendar, messages, and a home screen that highlights tasks needing attention.$summary$,
  $highlights$[
    "Targeted broadcasts — send a message to filtered groups; each family gets their own thread",
    "Admin forms hub — see all forms, signature progress, and downloads in one place",
    "Teacher mobile portal — home, calendar, messages, and my students on phone",
    "Parent forms snapshot — home card shows forms that still need a signature"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 16, 2026 — Admissions reminder emails and bulletin for families (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_15.sql

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
  '2026-09-16'::date,
  '07',
  'v1 launch prep',
  'Admissions reminder emails and bulletin for families',
  $summary$Families with unfinished applications or enrollment checklist steps now receive friendly reminder emails so nothing slips through the cracks. Parents and teachers can also read school bulletin posts from the MudKitchen mobile app, including PDF and image attachments.$summary$,
  $highlights$[
    "Incomplete admissions reminders — automatic emails when a draft or checklist step is still open",
    "Follow-up timing — a second reminder goes out if the family still has not finished",
    "Bulletin reading on mobile — parents and teachers view posts from home",
    "Attachment preview — open PDFs and images without leaving the app"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 17, 2026 — Friday Branch scheduling and parent enrollment (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_16.sql

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
  '2026-09-17'::date,
  '07',
  'v1 launch prep',
  'Friday Branch scheduling and parent enrollment',
  $summary$Co-op families can now browse and sign up for Friday classes. Admins build the schedule by block and semester, track capacity and waitlists, and parents enroll or withdraw from the parent portal. A Friday Branch section on the parent home page highlights open classes when the feature is turned on.$summary$,
  $highlights$[
    "Schedule builder — admins arrange Friday classes by time block and semester",
    "Parent enrollment — browse open classes, see spots left, enroll or join the waitlist",
    "Capacity tracking — confirmed, waitlisted, and withdrawn status stays up to date",
    "Home page card — parents see Friday Branch when classes are available"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 18, 2026 — Roster emails and faster mobile messaging (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_17.sql

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
  '2026-09-18'::date,
  '07',
  'v1 launch prep',
  'Roster emails and faster mobile messaging',
  $summary$Admins can email a formatted Friday class roster to teachers or volunteers — with a preview before sending. Mobile messaging feels snappier with smoother send and clearer attachment display in conversation threads.$summary$,
  $highlights$[
    "Roster email with preview — review the layout before sending class lists",
    "Family contact info — student names, families, and enrollment status in one email",
    "Faster mobile messages — quicker send and clearer attachment bubbles in threads"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 19, 2026 — Enrollment alerts and reminder timing (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_18.sql

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
  '2026-09-19'::date,
  '07',
  'v1 launch prep',
  'Enrollment alerts and reminder timing',
  $summary$School admins receive notifications when families enroll in Friday classes. Admissions reminder emails were refined so families are not contacted too soon after starting a draft application.$summary$,
  $highlights$[
    "Friday enrollment alerts — admins know when a child signs up for a Friday class",
    "Smarter reminder timing — admissions emails wait until a family has had time to finish",
    "Messaging reliability — continued improvements from the email and notifications release"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 20, 2026 — Attendance, push notifications, and activity inbox (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_19.sql

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
  '2026-09-20'::date,
  '07',
  'v1 launch prep',
  'Attendance, push notifications, and activity inbox',
  $summary$Teachers and admins can take attendance from the MudKitchen mobile app — mark present, absent, or late and record pickup details. Everyone gets push notifications when a new message arrives. A notification bell on the home screen shows recent school activity like enrollments and payments. Parents can also complete and sign forms from a dedicated Forms & Documents area.$summary$,
  $highlights$[
    "Mobile attendance — teachers and admins mark attendance by date with search and filters",
    "Push notifications — get alerted on your phone when a new message arrives; tap to open the thread",
    "Activity inbox — bell icon on home shows recent updates across the school",
    "Forms & Documents on mobile — complete and sign forms without leaving the app",
    "Unified home headers — consistent layout across parent, teacher, and admin apps"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 21, 2026 — Committee attachments and parent attendance history (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_20.sql

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
  '2026-09-21'::date,
  '07',
  'v1 launch prep',
  'Committee attachments and parent attendance history',
  $summary$Committee members can now add resources, events, and tasks themselves — not just admins. Committee chat supports file attachments so groups can share PDFs and images. Parents can view their child's attendance history on the MudKitchen mobile app.$summary$,
  $highlights$[
    "Member contributions — active committee members add resources, events, and tasks",
    "Message attachments — share PDFs and images in committee conversations",
    "Parent attendance history — see past attendance records per child on mobile",
    "Refreshed app icon — updated MudKitchen icon on iOS and Android"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 22, 2026 — Friday Branch pricing, flyers, and schedule polish (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_21.sql

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
  '2026-09-22'::date,
  '07',
  'v1 launch prep',
  'Friday Branch pricing, flyers, and schedule polish',
  $summary$Admins can set an optional price and attach a PDF flyer to each Friday class. Parents see the cost and can open the flyer when browsing classes. Schedule editing in the admin tool is smoother, with clearer confirmation when changes are saved.$summary$,
  $highlights$[
    "Class price and flyer — optional fee and downloadable PDF per Friday class",
    "Parent enrollment view — see price and open the flyer before signing up",
    "Schedule editor polish — easier time-slot editing and clearer save feedback"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
