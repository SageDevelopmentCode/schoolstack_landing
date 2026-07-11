-- Product foundation: guardians
-- Run after: add_product_families.sql

create table if not exists public.guardians (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  family_id        uuid not null references public.families(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  first_name       text not null,
  last_name        text not null,
  email            text,
  phone            text,
  relationship     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists guardians_organization_id_idx
  on public.guardians (organization_id);

create index if not exists guardians_family_id_idx
  on public.guardians (family_id);

create index if not exists guardians_user_id_idx
  on public.guardians (user_id)
  where user_id is not null;

drop trigger if exists on_guardians_updated on public.guardians;
create trigger on_guardians_updated
  before update on public.guardians
  for each row execute procedure public.handle_updated_at();
