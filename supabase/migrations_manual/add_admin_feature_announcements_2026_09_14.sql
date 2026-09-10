-- Promoted to supabase/migrations/20260914_add_admin_feature_announcements.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Admin dashboard "New features for you" cards (global defaults + per-org overrides)
-- Run after: add_enrollment_classrooms (20260913) on remote

create table if not exists public.admin_feature_announcements (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references public.organizations(id) on delete cascade,
  announcement_id  text not null,
  title            text not null,
  description      text not null,
  cta_label        text not null check (cta_label in ('Try it now', 'View', 'Open')),
  feature_key      text not null,
  href_path        text not null,
  published_at     date not null,
  published        boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists admin_feature_announcements_global_slug_idx
  on public.admin_feature_announcements (announcement_id)
  where organization_id is null;

create unique index if not exists admin_feature_announcements_org_slug_idx
  on public.admin_feature_announcements (organization_id, announcement_id)
  where organization_id is not null;

create index if not exists admin_feature_announcements_org_idx
  on public.admin_feature_announcements (organization_id, published_at desc);

drop trigger if exists on_admin_feature_announcements_updated on public.admin_feature_announcements;
create trigger on_admin_feature_announcements_updated
  before update on public.admin_feature_announcements
  for each row execute procedure public.handle_updated_at();

alter table public.admin_feature_announcements enable row level security;

drop policy if exists "Read published admin feature announcements" on public.admin_feature_announcements;
create policy "Read published admin feature announcements"
  on public.admin_feature_announcements
  for select
  using (
    published = true
    and (
      organization_id is null
      or public.user_is_active_org_member(organization_id)
    )
  );

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
    ('waive-tuition-charges', 'Waive tuition charges', 'Remove a charge from a family''s schedule when they should not be billed.', 'Open', 'my_school', 'my_school/tuition', '2026-09-10', 0),
    ('coop-supply-list', 'Co-op supply list', 'Set up a shared supply list so families can claim what they''ll bring.', 'Try it now', 'admissions', 'admissions/programs', '2026-09-09', 0),
    ('coop-teaching-schedule', 'Co-op teaching schedule', 'Publish teaching weeks and let parents sign up to volunteer.', 'Try it now', 'admissions', 'admissions/programs', '2026-09-09', 1),
    ('coop-curriculum-guides', 'Multiple curriculum guides', 'Upload and organize several curriculum PDFs per co-op program.', 'View', 'admissions', 'admissions/programs', '2026-09-08', 0),
    ('tuition-payment-history', 'Tuition payment history', 'See recent payments across families without opening each account.', 'Open', 'my_school', 'my_school/tuition', '2026-09-07', 0),
    ('committee-descriptions', 'Committee descriptions', 'Add a short description when creating a committee so members know what the group is for.', 'Try it now', 'committees', 'committees', '2026-09-05', 0),
    ('school-bulletin', 'School bulletin', 'Post updates to families, teachers, or programs with scheduling and attachments.', 'Try it now', 'bulletin', 'bulletin', '2026-09-04', 0),
    ('classroom-management', 'Classroom management', 'Create classrooms and assign students and guides by room.', 'Try it now', 'my_school', 'my_school/classrooms', '2026-09-04', 1),
    ('program-parent-portals', 'Program parent portals', 'Configure per-program portal URLs and choose what each program''s families can access.', 'View', 'admissions', 'admissions/programs', '2026-09-03', 0),
    ('tuition-workspace', 'Tuition workspace', 'Redesigned family sidebar, rate catalog, and billing panels in one place.', 'Open', 'my_school', 'my_school/tuition', '2026-09-03', 1),
    ('admissions-submissions', 'Admissions submissions', 'Clearer queue with next-step column and action-needed highlighting.', 'View', 'admissions', 'admissions/submissions', '2026-08-29', 0)
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
