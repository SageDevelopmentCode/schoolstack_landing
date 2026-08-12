-- School-wide calendar events for parent portal and admin Schedule → Events tab
-- Run after: 20260811_add_message_email_debounce.sql

-- ── organization_events ──────────────────────────────────────────────────────

create table if not exists public.organization_events (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  title            text not null,
  event_date       date not null,
  event_time       text,
  is_all_day       boolean not null default true,
  event_type       text not null default 'other'
                     check (event_type in ('field_trip', 'no_school', 'community', 'academic', 'other')),
  location         text,
  description      text,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists organization_events_org_date_idx
  on public.organization_events (organization_id, event_date);

drop trigger if exists on_organization_events_updated on public.organization_events;
create trigger on_organization_events_updated
  before update on public.organization_events
  for each row execute procedure public.handle_updated_at();

-- ── organization_events RLS ──────────────────────────────────────────────────

alter table public.organization_events enable row level security;

create policy "Platform admins manage organization_events"
  on public.organization_events for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Staff read organization_events"
  on public.organization_events for select to authenticated
  using (
    public.user_is_staff_org_member(organization_id)
  );

create policy "Org admins manage organization_events"
  on public.organization_events for all to authenticated
  using (
    public.user_is_org_admin(organization_id)
  )
  with check (
    public.user_is_org_admin(organization_id)
  );

create policy "Enrolled parents read organization_events"
  on public.organization_events for select to authenticated
  using (
    public.user_has_enrolled_parent_access(organization_id)
  );
