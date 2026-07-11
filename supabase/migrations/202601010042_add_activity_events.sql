-- Activity events: append-only audit log for parent, school-admin, and system actions
-- Run after: add_product_organizations.sql, add_product_rls_helpers.sql

create table if not exists public.activity_events (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_type      text not null,
  actor_user_id   uuid,
  actor_email     text,
  surface         text not null,
  action          text not null,
  entity_type     text,
  entity_id       uuid,
  summary         text not null,
  metadata        jsonb not null default '{}'::jsonb,
  severity        text not null default 'info',
  created_at      timestamptz not null default now(),

  constraint activity_events_severity_check
    check (severity in ('info', 'warning', 'error'))
);

create index if not exists activity_events_created_at_idx
  on public.activity_events (created_at desc);

create index if not exists activity_events_org_created_at_idx
  on public.activity_events (organization_id, created_at desc);

create index if not exists activity_events_action_created_at_idx
  on public.activity_events (action, created_at desc);

alter table public.activity_events enable row level security;

create policy "Platform admins read activity_events"
  on public.activity_events
  for select
  to authenticated
  using (public.is_platform_admin());

create policy "Authenticated users insert activity_events"
  on public.activity_events
  for insert
  to authenticated
  with check (actor_user_id is null or actor_user_id = auth.uid());
