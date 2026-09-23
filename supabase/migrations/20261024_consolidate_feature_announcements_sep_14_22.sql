-- Consolidate Sep 14–22 dashboard cards: merge committees + Friday Branch duplicates
-- Run after: 20261023_add_parent_feature_announcements_sep_14_22.sql

update public.admin_feature_announcements
set
  title = 'Committee workspaces',
  description = 'Run parent committees with a shared workspace for messages, calendar, resources, and tasks — including file attachments in chat.',
  published_at = '2026-09-21'::date
where organization_id is null
  and announcement_id = 'committee-workspace';

update public.admin_feature_announcements
set
  title = 'Friday Branch',
  description = 'Build Friday class schedules, email rosters to teachers, and set an optional price and PDF flyer per class. Families enroll or join the waitlist from the parent portal.',
  published_at = '2026-09-22'::date
where organization_id is null
  and announcement_id = 'friday-branch-scheduling';

update public.parent_feature_announcements
set
  title = 'Join a parent committee',
  description = 'Browse committees, request to join, and share PDFs and images in committee conversations.',
  published_at = '2026-09-21'::date
where organization_id is null
  and announcement_id = 'parent-committees';

update public.parent_feature_announcements
set
  title = 'Friday Branch classes',
  description = 'Browse open classes, see spots left, enroll or join the waitlist, and view class price and flyers before you sign up.',
  published_at = '2026-09-22'::date
where organization_id is null
  and announcement_id = 'friday-branch-enrollment';

delete from public.admin_feature_announcements
where organization_id is null
  and announcement_id in (
    'friday-roster-emails',
    'friday-branch-pricing-flyer',
    'committee-message-attachments'
  );

delete from public.parent_feature_announcements
where organization_id is null
  and announcement_id in (
    'friday-branch-pricing-flyer',
    'committee-message-attachments'
  );
