-- Newsletter edition version snapshots (manual save + restore)
-- Run after: 20261138_add_school_newsletters.sql

create table if not exists public.school_newsletter_edition_versions (
  id               uuid primary key default gen_random_uuid(),
  edition_id       uuid not null references public.school_newsletter_editions(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  snapshot         jsonb not null,
  kind             text not null
                     check (kind in ('manual_save', 'before_restore')),
  label            text,
  created_by       uuid references public.staff_members(id) on delete set null,
  created_at       timestamptz not null default now()
);

create index if not exists school_newsletter_edition_versions_edition_created_idx
  on public.school_newsletter_edition_versions (edition_id, created_at desc);

alter table public.school_newsletter_edition_versions enable row level security;

create policy "Platform admins manage school_newsletter_edition_versions"
  on public.school_newsletter_edition_versions for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins manage school_newsletter_edition_versions"
  on public.school_newsletter_edition_versions for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
