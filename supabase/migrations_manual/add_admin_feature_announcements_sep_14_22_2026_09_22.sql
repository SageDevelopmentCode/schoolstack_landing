-- Promoted to supabase/migrations/20261022_add_admin_feature_announcements_sep_14_22.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Idempotent — safe to re-run.

insert into public.admin_feature_announcements (
  organization_id,
  announcement_id,
  title,
  description,
  cta_label,
  feature_key,
  href_path,
  published_at,
  sort_order
)
select
  null,
  seed.announcement_id,
  seed.title,
  seed.description,
  seed.cta_label,
  seed.feature_key,
  seed.href_path,
  seed.published_at::date,
  seed.sort_order
from (
  values
    ('committee-workspace', 'Committee workspaces', 'Run parent committees with a shared workspace for messages, calendar, resources, and tasks — including file attachments in chat.', 'Try it now', 'committees', 'committees', '2026-09-21', 0),
    ('parent-message-broadcasts', 'Message broadcasts to parents', 'Send a message to filtered groups of parents; each family gets their own private thread.', 'Try it now', 'messages', 'messages', '2026-09-15', 0),
    ('admin-forms-documents', 'Forms and documents hub', 'Track every parent form across the school with signature progress and downloads.', 'Open', 'my_school', 'my_school/forms_documents', '2026-09-15', 1),
    ('incomplete-admissions-reminders', 'Admissions reminder emails', 'Automatic emails when families leave applications or enrollment steps unfinished.', 'View', 'admissions', 'admissions/submissions', '2026-09-16', 0),
    ('friday-branch-scheduling', 'Friday Branch', 'Build Friday class schedules, email rosters to teachers, and set an optional price and PDF flyer per class. Families enroll or join the waitlist from the parent portal.', 'Try it now', 'my_school', 'my_school/friday_branch', '2026-09-22', 0),
    ('mobile-attendance', 'Mobile attendance', 'Mark present, absent, or late from the MudKitchen mobile app.', 'Try it now', 'my_school', 'my_school/attendance', '2026-09-20', 0)
) as seed(
  announcement_id,
  title,
  description,
  cta_label,
  feature_key,
  href_path,
  published_at,
  sort_order
)
where not exists (
  select 1
  from public.admin_feature_announcements existing
  where existing.organization_id is null
    and existing.announcement_id = seed.announcement_id
);
