-- Organization progress log: August 9, 2026 — Portal messaging (Rooted Meadows)
-- Run after: add_organization_progress_log_2026_08_08.sql

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
  '2026-08-09'::date,
  '05',
  'Teacher portal',
  'In-portal messaging for families, guides, and school office',
  $summary$We launched secure messaging across the family, teacher, and school admin portals. Families can message the school office and their child's guides from a new Messages page, with unread badges so nothing gets missed. Teachers and admins use the same inbox — start a conversation, reply in real time, and attach files when you need to share a photo or document. Email notifications let you know when someone sends a message (without flooding your inbox if several arrive at once). Parents and staff can optionally enable browser push alerts for new messages.

For teachers, conversation threads show which student the message is about, and you can tap the child's name to open their profile right from the inbox. School admins see conversations grouped by families, staff, and the school office.$summary$,
  $highlights$[
    "Messages in every portal — families, guides, and admins each have a Messages page",
    "Start new conversations — reach the school office, a guide, or a family without leaving the portal",
    "Real-time updates — new messages appear without refreshing the page",
    "File attachments — share photos or documents in a thread",
    "Email and push notifications — get alerted when someone sends you a message",
    "Unread message badges — see new messages at a glance in the nav menu",
    "Teacher student context — threads show which child the conversation is about; open their profile from the inbox",
    "Admin inbox sections — conversations grouped by families, staff members, and school office"
  ]$highlights$::jsonb
from public.organizations o
where o.slug in ('rooted-meadows-school', 'rooted-meadows')
on conflict (organization_id, entry_date) do nothing;
