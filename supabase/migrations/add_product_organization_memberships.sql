-- Product foundation: organization_memberships (who belongs to which school)
-- Run after: add_product_organizations.sql

create table if not exists public.organization_memberships (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  role             text not null
                     check (role in ('owner', 'admin', 'teacher', 'parent', 'staff')),
  status           text not null default 'active'
                     check (status in ('invited', 'active', 'disabled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (organization_id, user_id)
);

create index if not exists organization_memberships_user_id_idx
  on public.organization_memberships (user_id);

create index if not exists organization_memberships_org_id_idx
  on public.organization_memberships (organization_id);

create index if not exists organization_memberships_org_role_idx
  on public.organization_memberships (organization_id, role)
  where status = 'active';

drop trigger if exists on_organization_memberships_updated on public.organization_memberships;
create trigger on_organization_memberships_updated
  before update on public.organization_memberships
  for each row execute procedure public.handle_updated_at();
