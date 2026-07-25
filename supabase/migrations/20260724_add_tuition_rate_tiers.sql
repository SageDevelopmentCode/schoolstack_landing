-- Tuition rate tiers: multiple amounts per rate plan (age group, schedule type, etc.)
-- Run after: 20260722_add_tuition_schema.sql

create table if not exists public.tuition_rate_tiers (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  rate_plan_id     uuid not null references public.tuition_rate_plans(id) on delete cascade,
  code             text not null,
  label            text not null,
  amount_cents     integer not null check (amount_cents >= 0),
  sort_order       integer not null default 0,
  is_default       boolean not null default false,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists tuition_rate_tiers_rate_plan_id_idx
  on public.tuition_rate_tiers (rate_plan_id);

create index if not exists tuition_rate_tiers_organization_id_idx
  on public.tuition_rate_tiers (organization_id);

create unique index if not exists tuition_rate_tiers_rate_plan_code_key
  on public.tuition_rate_tiers (rate_plan_id, code);

drop trigger if exists on_tuition_rate_tiers_updated on public.tuition_rate_tiers;
create trigger on_tuition_rate_tiers_updated
  before update on public.tuition_rate_tiers
  for each row execute procedure public.handle_updated_at();

-- Backfill one default tier per existing rate plan
insert into public.tuition_rate_tiers (
  organization_id,
  rate_plan_id,
  code,
  label,
  amount_cents,
  sort_order,
  is_default
)
select
  rp.organization_id,
  rp.id,
  'default',
  'Standard',
  rp.amount_cents,
  0,
  true
from public.tuition_rate_plans rp
where not exists (
  select 1
  from public.tuition_rate_tiers t
  where t.rate_plan_id = rp.id
);

alter table public.tuition_rate_tiers enable row level security;

create policy "Platform admins manage tuition_rate_tiers"
  on public.tuition_rate_tiers for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_rate_tiers"
  on public.tuition_rate_tiers for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Org admins manage tuition_rate_tiers"
  on public.tuition_rate_tiers for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
