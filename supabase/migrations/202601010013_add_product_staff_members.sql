-- Product foundation: staff_members
-- Run after: add_product_organizations.sql

create table if not exists public.staff_members (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  first_name       text not null,
  last_name        text not null,
  email            text,
  role_title       text,
  status           text not null default 'active'
                     check (status in ('active', 'inactive', 'on_leave')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists staff_members_organization_id_idx
  on public.staff_members (organization_id);

create index if not exists staff_members_user_id_idx
  on public.staff_members (user_id)
  where user_id is not null;

drop trigger if exists on_staff_members_updated on public.staff_members;
create trigger on_staff_members_updated
  before update on public.staff_members
  for each row execute procedure public.handle_updated_at();
