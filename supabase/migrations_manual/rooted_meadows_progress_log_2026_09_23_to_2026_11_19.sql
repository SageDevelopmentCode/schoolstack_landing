-- Rooted Meadows build logs: September 23 – November 19, 2026 (33 entries)
-- Paste into Supabase SQL Editor after add_organization_progress_log_2026_09_22.sql
-- Idempotent — safe to re-run.

-- Organization progress log: September 23, 2026 — Friday Branch in the mobile app and account controls (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_22.sql

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
  '2026-09-23'::date,
  '07',
  'v1 launch prep',
  'Friday Branch in the mobile app and account controls',
  $summary$Friday Branch now lives in the MudKitchen mobile app. Parents can browse the Friday class schedule, open class flyers, and see a Friday Branch card on Home, while admins can manage time slots and email class rosters from their phones. Parents and teachers can also request account deletion right from the app.$summary$,
  $highlights$[
    "Friday Branch for parents on mobile — class schedule, class details, and flyers in the app",
    "Friday Branch for admins on mobile — add time slots, edit classes, and email a class roster",
    "Account controls — request account deletion from the Account screen",
    "Committee task alerts — people are notified when a committee task is assigned to them"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 24, 2026 — Clearer payments in the mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_23.sql

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
  '2026-09-24'::date,
  '07',
  'v1 launch prep',
  'Clearer payments in the mobile app',
  $summary$Paying tuition in the MudKitchen mobile app is clearer. After checkout, parents land back in the app with a clear confirmation, and every charge shows a simple status. The app also lets families know when a new version is ready.$summary$,
  $highlights$[
    "Payment confirmation — see Payment received or Card saved after checking out",
    "Status tags — each charge shows Paid, Overdue, Scheduled, Late fee, or Waived",
    "Retry-friendly checkout — a checkout that could not start no longer leaves a payment stuck",
    "In-app updates — a prompt to restart when a new version of the app is available"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 27, 2026 — Edit and delete messages (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_24.sql

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
  '2026-09-27'::date,
  '07',
  'v1 launch prep',
  'Edit and delete messages',
  $summary$Families, teachers, and admins can now fix a typo or take back a message. Sent messages can be edited on the web and in the MudKitchen mobile app, and messages can be deleted from the app.$summary$,
  $highlights$[
    "Edit sent messages — corrections are marked as edited so everyone knows",
    "Edit and delete on mobile — a quick menu on each of your own messages",
    "Clear deleted state — removed messages show Message has been deleted"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

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

-- Organization progress log: September 29, 2026 — Bulletin emails and autopay reminders (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_28.sql

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
  '2026-09-29'::date,
  '07',
  'v1 launch prep',
  'Bulletin emails and autopay reminders',
  $summary$When a bulletin post is published, including scheduled posts, the families and staff it targets now get a short email about it. Families also get a reminder before autopay charges them. Non-essential emails now include an unsubscribe link, while receipts and payment notices always go out.$summary$,
  $highlights$[
    "Announcement emails — each bulletin post is emailed once to its audience with a short excerpt",
    "Autopay reminders — families hear before an autopay charge runs",
    "Unsubscribe link — families can opt out of non-essential emails; billing emails always arrive"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: September 30, 2026 — Co-op program in the mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_29.sql

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
  '2026-09-30'::date,
  '07',
  'v1 launch prep',
  'Co-op program in the mobile app',
  $summary$Co-op families can now switch into their co-op program in the MudKitchen mobile app, with a banner showing which portal they are in and a Home built around the co-op. Committees also show unread markers on each section so members can see what is new.$summary$,
  $highlights$[
    "Co-op portal on mobile — switch into the co-op with Overview, Family, Co-op, and Learn tabs",
    "Clear context — a Viewing Co-op banner shows which program you are in",
    "Committee unread markers — see new messages, tasks, resources, and events at a glance"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 1, 2026 — Autopay with saved payment methods (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_09_30.sql

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
  '2026-10-01'::date,
  '07',
  'v1 launch prep',
  'Autopay with saved payment methods',
  $summary$A card or bank account saved during checkout can now be used for autopay, so families only enter payment details once. Families get a receipt each time autopay runs. Committee members also get an email when their workspace has unread activity.$summary$,
  $highlights$[
    "Saved methods for autopay — the card or bank saved at checkout covers future charges",
    "Autopay receipts — amount, processing fee, payment method, and date in every receipt",
    "Committee activity emails — a heads-up when a committee has unread activity",
    "Unread counts — committee unread counts on the parent Committees page"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 3, 2026 — Bank payment verification and more co-op screens (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_01.sql

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
  '2026-10-03'::date,
  '07',
  'v1 launch prep',
  'Bank payment verification and more co-op screens',
  $summary$Bank (ACH) payments that need verification no longer look unpaid. Families get an email with a link to verify their bank, the school is told too, and billing shows the right status while a payment is processing. More of the co-op portal now works in the MudKitchen mobile app.$summary$,
  $highlights$[
    "Verify your bank email — families get a direct link, and admins are notified",
    "Honest payment status — Verify bank or Processing (usually 3–5 business days) instead of unpaid",
    "Co-op screens on mobile — Children, Committees, and Notification settings now work",
    "Reliable sign-in emails — magic links and sign-up confirmations always point to the live site"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 5, 2026 — Pause Friday Branch sign-ups and rate catalog assignment (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_03.sql

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
  '2026-10-05'::date,
  '07',
  'v1 launch prep',
  'Pause Friday Branch sign-ups and rate catalog assignment',
  $summary$Admins can pause Friday Branch sign-ups when classes are full or between sessions, and parents see a clear paused message on the web and in the app. In Tuition, admins can choose which rate catalog a student is billed from, or move them to another one.$summary$,
  $highlights$[
    "Pause Friday Branch — one switch stops new sign-ups, with a Paused badge for admins",
    "Clear for parents — Friday Branch signup is paused shows on web and mobile",
    "Rate catalog assignment — assign or move a student to a specific rate catalog",
    "Catalog details — see each family's rate catalog on the Families panel"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 6, 2026 — Failed bank payment alerts and in-app PDFs (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_05.sql

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
  '2026-10-06'::date,
  '07',
  'v1 launch prep',
  'Failed bank payment alerts and in-app PDFs',
  $summary$When a bank payment does not go through, the family and the school now both get an email so it can be sorted quickly. Forms and documents open in a PDF viewer inside the MudKitchen mobile app on iPhone and Android, and typed signatures now appear in a cursive style.$summary$,
  $highlights$[
    "Failed payment emails — families and admins are told when a bank payment fails",
    "In-app PDF viewer — open forms and documents without leaving the app, on iOS and Android",
    "Cursive signatures — typed signatures on agreements and forms look like signatures"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 15, 2026 — Faster apply page and safer bank payment handling (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_06.sql

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
  '2026-10-15'::date,
  '07',
  'v1 launch prep',
  'Faster apply page and safer bank payment handling',
  $summary$The online application loads faster, with a branded loading screen and each program's form loading only when a family picks it. Behind the scenes, a bank payment that fails after first showing as paid now reopens the charge correctly and can never be processed twice.$summary$,
  $highlights$[
    "Faster apply page — branded loading and per-program forms that load on demand",
    "Clear messages — families see a helpful note if a program is no longer offered",
    "Safer bank payments — failed ACH payments reopen the charge correctly",
    "No double processing — repeated payment notices are handled only once"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 18, 2026 — School Photos (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_15.sql

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
  '2026-10-18'::date,
  '07',
  'v1 launch prep',
  'School Photos',
  $summary$Rooted Meadows now has a school photo gallery. Admins can upload photos in batches grouped by date, teachers can share photos from their classrooms, and parents can browse the gallery in their portal.$summary$,
  $highlights$[
    "Admin photo uploads — add photos in batches, grouped by date, with edit and delete",
    "Teacher uploads — staff share photos and manage the ones they added",
    "Parent gallery — families browse school photos in the parent portal",
    "Smarter committee alerts — tapping a committee notification opens the right workspace"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 19, 2026 — School Profile and smarter visit reminders (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_18.sql

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
  '2026-10-19'::date,
  '07',
  'v1 launch prep',
  'School Profile and smarter visit reminders',
  $summary$A new School Profile keeps the school's details in one place: about and links, campus address, phones, emails, hours, directions, parking notes, and up to five school photos. Visit emails now pull from it, families get a reminder on the day of their visit, and applicants with open next steps get a gentle follow-up.$summary$,
  $highlights$[
    "School Profile — about, address, phones, emails, hours, directions, and parking notes",
    "School photos — up to five photos to show off the campus",
    "Day-of visit reminders — tours and observations get a same-day reminder with school contact details",
    "Application follow-ups — up to two reminders for families with required next steps"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

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

-- Organization progress log: October 21, 2026 — Photos in the mobile app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_20.sql

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
  '2026-10-21'::date,
  '07',
  'v1 launch prep',
  'Photos in the mobile app',
  $summary$School Photos arrived in the MudKitchen mobile app for everyone. Admins can upload, browse, and change a photo's date from their phone, and teachers and parents, including co-op families, can view the gallery on the go.$summary$,
  $highlights$[
    "Admin photos on mobile — upload, grid view, full-screen viewer, and date changes",
    "Teacher and parent galleries — browse school photos in the app, including in the co-op portal",
    "Support on Home — a MudKitchen Support messages card for parents and teachers"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 22, 2026 — Co-op curriculum and teaching schedule in the app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_21.sql

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
  '2026-10-22'::date,
  '07',
  'v1 launch prep',
  'Co-op curriculum and teaching schedule in the app',
  $summary$Co-op families can now open the curriculum, supply list, and their teaching schedule in the MudKitchen mobile app. Billing, calendar, and Friday Branch screens in the co-op portal were refreshed, and committee workspaces got a mobile-friendly menu on the web.$summary$,
  $highlights$[
    "Curriculum on mobile — read the co-op curriculum in the app",
    "Supply list and teaching schedule — see what to bring and when you teach",
    "Committee menu — committee workspaces are easier to navigate on a phone browser",
    "Smoother loading — placeholders while committees, curriculum, and PDFs load"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: October 25, 2026 — Dashboard tabs, enrollment flows, and a newsletter workspace (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_22.sql

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
  '2026-10-25'::date,
  '07',
  'v1 launch prep',
  'Dashboard tabs, enrollment flows, and a newsletter workspace',
  $summary$The admin Dashboard is organised into Today, Journey, Activity, and Guides so it is easier to see what needs attention. A new Enrollment Flows overview shows each program's forms and steps, and a first newsletter workspace lets admins draft newsletters with stories, events, and reminders. Admins can also book a tour or observation for a family themselves.$summary$,
  $highlights$[
    "Dashboard tabs — Today, Journey, Activity, and Guides",
    "Enrollment Flows — one card per program showing its forms, steps, and what needs attention",
    "Newsletter workspace — three layouts with stories, events, reminders, and a preview",
    "Book a visit for a family — admins can schedule a tour or observation slot for a family or guest"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

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

-- Organization progress log: October 29, 2026 — Newsletters saved with version history (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_28.sql

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
  '2026-10-29'::date,
  '07',
  'v1 launch prep',
  'Newsletters saved with version history',
  $summary$Newsletters are now saved in MudKitchen, with drafts and published editions, a school-wide template, and version history so admins can restore an earlier version. On mobile, the keyboard no longer covers what you are typing in messages and forms.$summary$,
  $highlights$[
    "Saved newsletters — drafts and published editions kept safely",
    "School template — start each edition from the school's own template",
    "Version history — restore an earlier version of any edition",
    "Keyboard fix — typing in messages, sheets, and forms stays visible on mobile"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 1, 2026 — Families can read newsletters, plus committee projects (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_10_29.sql

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
  '2026-11-01'::date,
  '07',
  'v1 launch prep',
  'Families can read newsletters, plus committee projects',
  $summary$Families can now read school newsletters in the parent portal and the MudKitchen mobile app, including in the co-op portal, and get an email and push notification when a new edition is published. Committees can organise their work into projects with detailed supply lists. In enrollment, choosing Conditional Support now also requires the Standard Enrollment Agreement.$summary$,
  $highlights$[
    "Newsletters for families — read editions on the web and in the app",
    "Publish alerts — families get an email and push notification for each new edition",
    "Committee projects — supply lists with reusable or used-up items, months needed, owner, where to buy, and price",
    "Enrollment agreements — Conditional Support families also complete the Standard Enrollment Agreement",
    "Sturdier photo uploads — large uploads from the app are split up and recover from partial failures"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 3, 2026 — Staff time clock (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_01.sql

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
  '2026-11-03'::date,
  '07',
  'v1 launch prep',
  'Staff time clock',
  $summary$Teachers can now clock in and out from the web or the MudKitchen mobile app and see their hours by day, week, and month. Admins get a Staff Hours tab under My School showing who is on the clock and each person's totals, plus a Staff hours today card on the Dashboard. Admins can also send one message to many families from the mobile app.$summary$,
  $highlights$[
    "My Hours for teachers — clock in and out with a running timer and day, week, and month totals",
    "Staff Hours for admins — who is on the clock now, with hours and sessions per staff member",
    "Dashboard card — Staff hours today at a glance",
    "Broadcast from mobile — message families by program, classroom, grade, or parent",
    "Reliable clock-out — double taps or two devices no longer cause trouble"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 7, 2026 — Family privacy, a faster parent portal, and safer sign-ups (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_03.sql

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
  '2026-11-07'::date,
  '07',
  'v1 launch prep',
  'Family privacy, a faster parent portal, and safer sign-ups',
  $summary$Family data is locked down further: a parent can only ever read their own family's billing, payment methods, and signatures. The parent sign-in page was redesigned and parent pages load faster. Classroom sign-ups now check capacity and eligibility so a slot can never be overfilled.$summary$,
  $highlights$[
    "Stronger family privacy — billing, payment, and signature data stay with each family",
    "New parent sign-in — a redesigned sign-in page",
    "Faster parent pages — quicker access checks on every page",
    "Safer classroom sign-ups — capacity and eligibility enforced, and withdrawals apply to the right child",
    "Lighter PDFs on mobile — large curriculum PDFs load only the pages being read"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 8, 2026 — Adjust hours (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_07.sql

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
  '2026-11-08'::date,
  '07',
  'v1 launch prep',
  'Adjust hours',
  $summary$Teachers can now add or fix time clock sessions for past days from a new Adjust hours panel, so a forgotten clock-in is easy to correct. School-wide lists like staff and the tuition catalog are now visible only to staff.$summary$,
  $highlights$[
    "Adjust hours — add or correct clocked sessions for earlier days",
    "Tighter access — staff lists and the tuition catalog are staff-only",
    "Accurate totals — day totals include sessions still in progress"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 10, 2026 — Approval for hour changes (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_08.sql

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
  '2026-11-10'::date,
  '07',
  'v1 launch prep',
  'Approval for hour changes',
  $summary$Admins can choose to require approval when teachers adjust their hours, and review requests from a Requests panel on the web or in the MudKitchen mobile app. Teachers get an email and push notification when a change is approved or denied.$summary$,
  $highlights$[
    "Approval setting — turn on Require approval for hour adjustments in Staff Hours",
    "Requests panel — approve or deny teacher changes in one place",
    "Mobile support — teachers adjust hours and admins review requests from their phones",
    "Decision alerts — teachers get an email and push notification with the outcome"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 12, 2026 — Hours polish and application PDF fix (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_10.sql

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
  '2026-11-12'::date,
  '07',
  'v1 launch prep',
  'Hours polish and application PDF fix',
  $summary$The staff time clock is sturdier: saving an hours change is all-or-nothing, overlapping sessions are blocked, and teachers can step back through earlier weeks. Downloading an application as a PDF works again for admins.$summary$,
  $highlights$[
    "All-or-nothing saves — a failed save never leaves a day half-changed",
    "Overlap protection — sessions can no longer overlap",
    "Earlier weeks — teachers can browse back through past weeks",
    "Application PDFs — admins can download applications as PDFs again"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 13, 2026 — Parent portal redesign begins (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_12.sql

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
  '2026-11-13'::date,
  '07',
  'v1 launch prep',
  'Parent portal redesign begins',
  $summary$The parent portal is getting a fresh, friendlier look. The new Home starts with a Start here to-do list and a card for each child with their enrollment progress, alongside upcoming events and the bulletin. Messages, Billing, Calendar, and Committees were redesigned too, and admins got a refreshed committee workspace.$summary$,
  $highlights$[
    "New parent Home — Start here, child cards with checklist progress, events, bulletin, and forms",
    "Tuition setup tracker — plan, agreements, payment method, and pay, step by step",
    "Calendar views — new month and week views with an event drawer",
    "Redesigned Messages and Committees — for parents, with a refreshed admin committee workspace"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 14, 2026 — New parent navigation and admin Dashboard (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_13.sql

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
  '2026-11-14'::date,
  '07',
  'v1 launch prep',
  'New parent navigation and admin Dashboard',
  $summary$Parents have new navigation with a notifications bell, a portal switcher for the co-op, and a profile menu, and the child record, Forms, Attendance, Photos, and Classroom signups pages were redesigned. Admins have a new Dashboard with a Today's focus list, setup progress, key numbers, and a live attendance board.$summary$,
  $highlights$[
    "Parent navigation — notifications bell, portal switcher, and profile menu",
    "Redesigned parent pages — child record, Forms, Attendance, Photos, Classroom signups, and the applicant dashboard",
    "Admin Today's focus — a list of what needs doing today",
    "Attendance board — mark present or record pickup in one click from the Dashboard"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 15, 2026 — My School redesign and a new parent app (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_14.sql

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
  '2026-11-15'::date,
  '07',
  'v1 launch prep',
  'My School redesign and a new parent app',
  $summary$Every My School tab in the admin portal was redesigned, from School Profile and Staff to Attendance, Friday Branch, and Tuition, with clearer save bars, undo, and visible retry when something fails. Admissions got the same treatment. In the MudKitchen mobile app, the parent experience was rebuilt with a new tab bar and refreshed Home, Billing, Messages, Calendar, Children, Committees, and Attendance.$summary$,
  $highlights$[
    "My School redesign — every tab refreshed, with save bars, undo, and retry instead of silent failures",
    "Safer edits — Friday Branch and Tuition never save over real data after a failed load",
    "Handy shortcuts — move students between classrooms and see who still needs attendance",
    "Admissions redesign — a cleaner admissions workspace",
    "New parent app — new tab bar plus redesigned Home, Billing, Messages, Calendar, Children, and more"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 16, 2026 — Teacher portal and admin app redesign (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_15.sql

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
  '2026-11-16'::date,
  '07',
  'v1 launch prep',
  'Teacher portal and admin app redesign',
  $summary$The teacher portal now opens with a Today's steps list and a guided roll call that goes one student at a time, and teachers can remind families who have not yet signed up for a classroom signup. The admin experience in the MudKitchen mobile app was redesigned, and the admin web portal gained a collapsible sidebar and a quick Find a page search.$summary$,
  $highlights$[
    "Teacher Today's steps — a clear list of the day plus guided roll call",
    "Sign-up reminders — teachers nudge families by email and push",
    "Admin app redesign — Dashboard, Admissions, Students, Staff, Schedule, Photos, Staff Hours, and more",
    "Faster admin navigation — collapsible sidebar and Find a page search (Cmd+K)",
    "Teacher app redesign — Home with a time clock card, Students, Calendar, Messages, and Photos"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 17, 2026 — My Hours refresh and a new app intro (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_16.sql

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
  '2026-11-17'::date,
  '07',
  'v1 launch prep',
  'My Hours refresh and a new app intro',
  $summary$My Hours for teachers has a clearer On the clock / Off the clock card. Sign-up reminders are limited to one per hour, and teachers are told if no family could be reached. The MudKitchen mobile app now opens with a short intro that walks through a school day before sign-in.$summary$,
  $highlights$[
    "Time clock card — On the clock or Off the clock at a glance",
    "Considerate reminders — at most one sign-up reminder per hour, with feedback if nobody was reached",
    "App intro — a short walkthrough of the time clock, attendance, and messages"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 18, 2026 — Redesigned apply experience and a Family view builder (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_17.sql

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
  '2026-11-18'::date,
  '07',
  'v1 launch prep',
  'Redesigned apply experience and a Family view builder',
  $summary$Families applying to Rooted Meadows see a redesigned application form, sign-in step, and tour booking. Admins can now edit the application form and checklist in a Family view that shows exactly what families will see, with a stage bar and a final review step to catch anything that needs fixing.$summary$,
  $highlights$[
    "New apply experience — redesigned application, sign-in, and tour booking",
    "Family view builder — edit forms on a live preview of the family experience",
    "Stage bar and final review — step through setup and catch anything that needs a fix"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;

-- Organization progress log: November 19, 2026 — Newsletters for teachers and a new reader (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_11_18.sql

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
  '2026-11-19'::date,
  '07',
  'v1 launch prep',
  'Newsletters for teachers and a new reader',
  $summary$Teachers can now read school newsletters on the web and in the MudKitchen mobile app. The admin newsletter editor was rebuilt with a Before you publish checklist and the school's colours, and parents get a new full-screen reader with earlier editions close at hand. The app also recovers more gracefully on older phones.$summary$,
  $highlights$[
    "Newsletters for teachers — staff read every edition on web and mobile",
    "Rebuilt editor — a Before you publish checklist and school colours",
    "Parent reader — full-screen reading with earlier editions",
    "Steadier app — viewers recover on their own and older Android versions get an update hint instead of crashing"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
