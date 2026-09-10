-- Promoted to supabase/migrations/20260915_add_parent_feature_announcements.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Parent portal "New features for you" cards (global defaults + per-org overrides)
-- Run after: add_admin_feature_announcements_2026_09_14.sql

create table if not exists public.parent_feature_announcements (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references public.organizations(id) on delete cascade,
  announcement_id  text not null,
  title            text not null,
  description      text not null,
  cta_label        text not null check (cta_label in ('Try it now', 'View', 'Open')),
  feature_key      text not null,
  href_path        text not null,
  portal_scope     text not null default 'any' check (portal_scope in ('any', 'main', 'coop')),
  published_at     date not null,
  published        boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists parent_feature_announcements_global_slug_idx
  on public.parent_feature_announcements (announcement_id)
  where organization_id is null;

create unique index if not exists parent_feature_announcements_org_slug_idx
  on public.parent_feature_announcements (organization_id, announcement_id)
  where organization_id is not null;

create index if not exists parent_feature_announcements_org_idx
  on public.parent_feature_announcements (organization_id, published_at desc);

drop trigger if exists on_parent_feature_announcements_updated on public.parent_feature_announcements;
create trigger on_parent_feature_announcements_updated
  before update on public.parent_feature_announcements
  for each row execute procedure public.handle_updated_at();

alter table public.parent_feature_announcements enable row level security;

drop policy if exists "Read published parent feature announcements" on public.parent_feature_announcements;
create policy "Read published parent feature announcements"
  on public.parent_feature_announcements
  for select
  using (
    published = true
    and (
      organization_id is null
      or public.user_is_active_org_member(organization_id)
    )
  );

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
    ('activity-notifications', 'See what''s new at a glance', 'Your notification center highlights new messages, bulletin posts, and co-op updates so nothing important gets missed.', 'Try it now', 'portal', 'documentation', 'any', '2026-09-10', 0),
    ('how-to-guides', 'Step-by-step how-to guides', 'Searchable help articles walk you through billing, messages, curriculum, and more.', 'View', 'portal', 'documentation', 'any', '2026-09-10', 1),
    ('coop-supply-list', 'Claim items on the supply list', 'Sign up to bring specific supplies for co-op days and see what still needs to be covered.', 'Try it now', 'supply_list', 'supply_list', 'coop', '2026-09-09', 0),
    ('coop-teaching-schedule', 'Sign up to teach a co-op week', 'View the teaching schedule and volunteer to lead or help on a co-op day.', 'Try it now', 'teaching_schedule', 'teaching_schedule', 'coop', '2026-09-09', 1),
    ('school-bulletin-home', 'School updates on your home page', 'Recent school bulletin posts now appear right on your home page.', 'View', 'bulletin', 'portal', 'any', '2026-09-04', 0),
    ('bulletin-attachments', 'Open bulletin attachments in the portal', 'Preview images and files from school updates without leaving the parent portal.', 'Try it now', 'bulletin', 'portal', 'any', '2026-09-05', 1),
    ('coop-family-directory', 'Message families in your co-op', 'See other families in your program and start a conversation from the directory.', 'Try it now', 'messages', 'messages', 'coop', '2026-09-04', 2),
    ('curriculum-pdf-viewer', 'Read curriculum guides in the browser', 'Open your program curriculum PDF inside the portal with a clickable table of contents.', 'View', 'curriculum', 'curriculum', 'coop', '2026-09-07', 0),
    ('curriculum-discussion', 'Discuss curriculum while you read', 'Comment in a sidebar alongside the curriculum document.', 'Try it now', 'curriculum', 'curriculum', 'coop', '2026-09-08', 1),
    ('curriculum-multiple-guides', 'Browse multiple curriculum guides', 'Switch between several curriculum documents when your program shares more than one guide.', 'View', 'curriculum', 'curriculum', 'coop', '2026-09-08', 2),
    ('portal-switcher', 'Switch between school and co-op portals', 'Move between your main school portal and your co-op program portal without getting lost.', 'Open', 'portal', 'portal', 'coop', '2026-09-08', 3),
    ('program-parent-portal', 'Your program''s own parent portal', 'Co-op families now have a dedicated portal with features chosen for your program.', 'View', 'portal', 'portal', 'coop', '2026-09-03', 0)
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
