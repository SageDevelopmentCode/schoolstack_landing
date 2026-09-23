-- Promoted to supabase/migrations/20261023_add_parent_feature_announcements_sep_14_22.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.
-- Idempotent — safe to re-run.

insert into public.parent_feature_announcements (
  organization_id,
  announcement_id,
  title,
  description,
  cta_label,
  feature_key,
  href_path,
  portal_scope,
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
  seed.portal_scope,
  seed.published_at::date,
  seed.sort_order
from (
  values
    ('parent-committees', 'Join a parent committee', 'Browse committees, request to join, and share PDFs and images in committee conversations.', 'Try it now', 'committees', 'committees', 'coop', '2026-09-21', 0),
    ('classroom-signups-respond', 'Respond to classroom sign-ups', 'See volunteer requests from teachers and respond from your home page.', 'Try it now', 'classroom_signups', 'classroom_signups', 'any', '2026-09-14', 0),
    ('parent-forms-documents', 'Forms and documents', 'View, fill, and sign forms that need your attention.', 'Open', 'forms_documents', 'forms_documents', 'any', '2026-09-15', 0),
    ('friday-branch-enrollment', 'Friday Branch classes', 'Browse open classes, see spots left, enroll or join the waitlist, and view class price and flyers before you sign up.', 'Try it now', 'friday_branch', 'friday_branch', 'coop', '2026-09-22', 0),
    ('message-push-notifications', 'Message alerts on your phone', 'Get alerted on your phone when a new message arrives in the MudKitchen mobile app.', 'Try it now', 'messages', 'messages', 'any', '2026-09-20', 0),
    ('parent-attendance-history', 'Your child''s attendance history', 'See past attendance records for each of your children.', 'View', 'attendance', 'attendance', 'any', '2026-09-21', 1)
) as seed(
  announcement_id,
  title,
  description,
  cta_label,
  feature_key,
  href_path,
  portal_scope,
  published_at,
  sort_order
)
where not exists (
  select 1
  from public.parent_feature_announcements existing
  where existing.organization_id is null
    and existing.announcement_id = seed.announcement_id
);
