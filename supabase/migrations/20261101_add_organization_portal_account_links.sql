-- Portal account link groups: union portal access across multiple auth users per school.
-- Run after: 20261031_add_public_tour_booking.sql

create table if not exists public.organization_portal_account_link_groups (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  primary_user_id   uuid not null references auth.users(id) on delete cascade,
  label             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists organization_portal_account_link_groups_org_id_idx
  on public.organization_portal_account_link_groups (organization_id);

create index if not exists organization_portal_account_link_groups_primary_user_idx
  on public.organization_portal_account_link_groups (organization_id, primary_user_id);

drop trigger if exists on_organization_portal_account_link_groups_updated
  on public.organization_portal_account_link_groups;

create trigger on_organization_portal_account_link_groups_updated
  before update on public.organization_portal_account_link_groups
  for each row execute procedure public.handle_updated_at();

create table if not exists public.organization_portal_account_link_members (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null references public.organization_portal_account_link_groups(id) on delete cascade,
  organization_id   uuid not null references public.organizations(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (group_id, user_id),
  unique (organization_id, user_id)
);

create index if not exists organization_portal_account_link_members_group_id_idx
  on public.organization_portal_account_link_members (group_id);

create index if not exists organization_portal_account_link_members_user_id_idx
  on public.organization_portal_account_link_members (organization_id, user_id);

drop trigger if exists on_organization_portal_account_link_members_updated
  on public.organization_portal_account_link_members;

create trigger on_organization_portal_account_link_members_updated
  before update on public.organization_portal_account_link_members
  for each row execute procedure public.handle_updated_at();

alter table public.organization_portal_account_link_groups enable row level security;
alter table public.organization_portal_account_link_members enable row level security;

drop policy if exists "Link group members can read groups"
  on public.organization_portal_account_link_groups;

create policy "Link group members can read groups"
  on public.organization_portal_account_link_groups
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_portal_account_link_members m
      where m.group_id = organization_portal_account_link_groups.id
        and m.user_id = auth.uid()
    )
    or public.is_platform_admin()
  );

drop policy if exists "Platform admins manage link groups"
  on public.organization_portal_account_link_groups;

create policy "Platform admins manage link groups"
  on public.organization_portal_account_link_groups
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Link group members can read members"
  on public.organization_portal_account_link_members;

create policy "Link group members can read members"
  on public.organization_portal_account_link_members
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.organization_portal_account_link_members self
      where self.group_id = organization_portal_account_link_members.group_id
        and self.user_id = auth.uid()
    )
    or public.is_platform_admin()
  );

drop policy if exists "Platform admins manage link members"
  on public.organization_portal_account_link_members;

create policy "Platform admins manage link members"
  on public.organization_portal_account_link_members
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
