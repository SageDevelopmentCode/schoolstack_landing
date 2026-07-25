-- Committees: templates, workspace instances, and child records
-- Run after: 20260725_add_assignment_rate_tier.sql

-- ── committee_templates ──────────────────────────────────────────────────────

create table if not exists public.committee_templates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references public.organizations(id) on delete cascade,
  slug             text not null,
  name             text not null,
  type             text not null
                     check (type in ('long_term_role', 'annual_volunteer', 'event', 'hybrid')),
  description      text not null default '',
  config           jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists committee_templates_org_slug_idx
  on public.committee_templates (organization_id, slug)
  where organization_id is not null;

create unique index if not exists committee_templates_platform_slug_idx
  on public.committee_templates (slug)
  where organization_id is null;

create index if not exists committee_templates_organization_id_idx
  on public.committee_templates (organization_id)
  where organization_id is not null;

drop trigger if exists on_committee_templates_updated on public.committee_templates;
create trigger on_committee_templates_updated
  before update on public.committee_templates
  for each row execute procedure public.handle_updated_at();

-- ── committees ───────────────────────────────────────────────────────────────

create table if not exists public.committees (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  template_id      uuid references public.committee_templates(id) on delete set null,
  name             text not null,
  description      text not null default '',
  status           text not null default 'draft'
                     check (status in ('draft', 'active', 'archived')),
  term_label       text not null default '',
  term_start       date,
  term_end         date,
  about_html       text not null default '',
  config           jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists committees_organization_id_idx
  on public.committees (organization_id);

create index if not exists committees_org_status_idx
  on public.committees (organization_id, status);

create index if not exists committees_template_id_idx
  on public.committees (template_id)
  where template_id is not null;

drop trigger if exists on_committees_updated on public.committees;
create trigger on_committees_updated
  before update on public.committees
  for each row execute procedure public.handle_updated_at();

-- ── committee_members ────────────────────────────────────────────────────────

create table if not exists public.committee_members (
  id               uuid primary key default gen_random_uuid(),
  committee_id     uuid not null references public.committees(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  guardian_id      uuid references public.guardians(id) on delete set null,
  staff_member_id  uuid references public.staff_members(id) on delete set null,
  display_name     text not null,
  email            text,
  phone            text,
  role             text not null default 'member'
                     check (role in ('member', 'lead', 'faculty_liaison', 'admin')),
  grade            text,
  bio              text,
  term_start       date,
  term_end         date,
  status           text not null default 'active'
                     check (status in ('active', 'invited', 'removed')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists committee_members_committee_id_idx
  on public.committee_members (committee_id);

create index if not exists committee_members_organization_id_idx
  on public.committee_members (organization_id);

create index if not exists committee_members_user_id_idx
  on public.committee_members (user_id)
  where user_id is not null;

create index if not exists committee_members_guardian_id_idx
  on public.committee_members (guardian_id)
  where guardian_id is not null;

drop trigger if exists on_committee_members_updated on public.committee_members;
create trigger on_committee_members_updated
  before update on public.committee_members
  for each row execute procedure public.handle_updated_at();

-- ── committee_duty_roles ─────────────────────────────────────────────────────

create table if not exists public.committee_duty_roles (
  id                   uuid primary key default gen_random_uuid(),
  committee_id         uuid not null references public.committees(id) on delete cascade,
  title                text not null,
  description          text not null default '',
  assignee_member_id   uuid references public.committee_members(id) on delete set null,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists committee_duty_roles_committee_id_idx
  on public.committee_duty_roles (committee_id);

create index if not exists committee_duty_roles_assignee_idx
  on public.committee_duty_roles (assignee_member_id)
  where assignee_member_id is not null;

drop trigger if exists on_committee_duty_roles_updated on public.committee_duty_roles;
create trigger on_committee_duty_roles_updated
  before update on public.committee_duty_roles
  for each row execute procedure public.handle_updated_at();

-- ── committee_tasks ──────────────────────────────────────────────────────────

create table if not exists public.committee_tasks (
  id                   uuid primary key default gen_random_uuid(),
  committee_id         uuid not null references public.committees(id) on delete cascade,
  title                text not null,
  description          text,
  group_key            text not null default 'general',
  status               text not null default 'open'
                         check (status in ('open', 'claimed', 'in_progress', 'done')),
  assignee_member_id   uuid references public.committee_members(id) on delete set null,
  due_date             date,
  attachment_label     text,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists committee_tasks_committee_id_idx
  on public.committee_tasks (committee_id);

create index if not exists committee_tasks_status_idx
  on public.committee_tasks (committee_id, status);

create index if not exists committee_tasks_due_date_idx
  on public.committee_tasks (committee_id, due_date)
  where due_date is not null;

drop trigger if exists on_committee_tasks_updated on public.committee_tasks;
create trigger on_committee_tasks_updated
  before update on public.committee_tasks
  for each row execute procedure public.handle_updated_at();

-- ── committee_events ─────────────────────────────────────────────────────────

create table if not exists public.committee_events (
  id               uuid primary key default gen_random_uuid(),
  committee_id     uuid not null references public.committees(id) on delete cascade,
  title            text not null,
  event_date       date not null,
  event_time       text,
  event_type       text not null default 'meeting'
                     check (event_type in ('meeting', 'deadline', 'service', 'event')),
  location         text,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists committee_events_committee_id_idx
  on public.committee_events (committee_id);

create index if not exists committee_events_date_idx
  on public.committee_events (committee_id, event_date);

drop trigger if exists on_committee_events_updated on public.committee_events;
create trigger on_committee_events_updated
  before update on public.committee_events
  for each row execute procedure public.handle_updated_at();

-- ── committee_resources ──────────────────────────────────────────────────────

create table if not exists public.committee_resources (
  id                     uuid primary key default gen_random_uuid(),
  committee_id           uuid not null references public.committees(id) on delete cascade,
  title                  text not null,
  resource_type          text not null default 'link'
                           check (resource_type in ('pdf', 'doc', 'link', 'checklist')),
  url                    text,
  description            text,
  allowed_duty_role_ids  uuid[] not null default '{}'::uuid[],
  sort_order             integer not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists committee_resources_committee_id_idx
  on public.committee_resources (committee_id);

drop trigger if exists on_committee_resources_updated on public.committee_resources;
create trigger on_committee_resources_updated
  before update on public.committee_resources
  for each row execute procedure public.handle_updated_at();

-- ── committee_messages ───────────────────────────────────────────────────────

create table if not exists public.committee_messages (
  id                 uuid primary key default gen_random_uuid(),
  committee_id       uuid not null references public.committees(id) on delete cascade,
  sender_member_id   uuid references public.committee_members(id) on delete set null,
  body               text not null,
  created_at         timestamptz not null default now()
);

create index if not exists committee_messages_committee_id_idx
  on public.committee_messages (committee_id, created_at desc);
