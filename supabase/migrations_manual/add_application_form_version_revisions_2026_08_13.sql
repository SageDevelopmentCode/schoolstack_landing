-- Promoted to supabase/migrations/20260816_add_application_form_version_revisions.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

create table if not exists public.application_form_version_revisions (
  id                   uuid primary key default gen_random_uuid(),
  form_version_id      uuid not null references public.application_form_versions(id) on delete cascade,
  organization_id      uuid not null references public.organizations(id) on delete cascade,
  activity_event_id    uuid references public.activity_events(id) on delete set null,
  revision_number      integer not null check (revision_number > 0),
  title                text not null,
  intro                text,
  program_id           uuid references public.programs(id) on delete set null,
  public_slug          text,
  status               text not null,
  schema               jsonb not null default '{}'::jsonb,
  fee_config           jsonb not null default '{}'::jsonb,
  post_submit_config   jsonb not null default '{}'::jsonb,
  notification_config  jsonb not null default '{}'::jsonb,
  changed_fields       text[] not null default '{}'::text[],
  change_summary       jsonb not null default '[]'::jsonb,
  created_by_user_id   uuid,
  created_at           timestamptz not null default now(),

  constraint application_form_version_revisions_status_check
    check (status in ('draft', 'published', 'archived'))
);

create unique index if not exists application_form_version_revisions_form_revision_key
  on public.application_form_version_revisions (form_version_id, revision_number);

create index if not exists application_form_version_revisions_form_created_at_idx
  on public.application_form_version_revisions (form_version_id, created_at desc);

create index if not exists application_form_version_revisions_activity_event_id_idx
  on public.application_form_version_revisions (activity_event_id)
  where activity_event_id is not null;

create index if not exists application_form_version_revisions_organization_id_idx
  on public.application_form_version_revisions (organization_id);

alter table public.application_form_version_revisions enable row level security;

create policy "Platform admins manage application_form_version_revisions"
  on public.application_form_version_revisions
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members can read application_form_version_revisions"
  on public.application_form_version_revisions
  for select
  to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins can insert application_form_version_revisions"
  on public.application_form_version_revisions
  for insert
  to authenticated
  with check (public.user_is_org_admin(organization_id));

create policy "Org admins can update application_form_version_revisions"
  on public.application_form_version_revisions
  for update
  to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
