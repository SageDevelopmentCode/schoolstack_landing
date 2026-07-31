-- Promoted to supabase/migrations/20260731_add_tuition_late_fees.sql for local/CI.
-- Run this file in Supabase SQL Editor on remote if that migration has not been applied.

-- Late fee charges, charge metadata, and per-month late fee day overrides.

alter table public.tuition_charges
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.tuition_charges
  drop constraint if exists tuition_charges_charge_type_check;

alter table public.tuition_charges
  add constraint tuition_charges_charge_type_check
  check (charge_type in ('tuition', 'fee', 'adjustment_credit', 'late_fee'));

create index if not exists tuition_charges_late_fee_source_idx
  on public.tuition_charges (organization_id, charge_type)
  where charge_type = 'late_fee';

create table if not exists public.tuition_late_fee_overrides (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references public.organizations(id) on delete cascade,
  year                    integer not null check (year >= 2000 and year <= 2100),
  month                   integer not null check (month >= 1 and month <= 12),
  late_fee_day_of_month   integer not null check (late_fee_day_of_month >= 1 and late_fee_day_of_month <= 28),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (organization_id, year, month)
);

create index if not exists tuition_late_fee_overrides_org_idx
  on public.tuition_late_fee_overrides (organization_id);

drop trigger if exists on_tuition_late_fee_overrides_updated on public.tuition_late_fee_overrides;
create trigger on_tuition_late_fee_overrides_updated
  before update on public.tuition_late_fee_overrides
  for each row execute procedure public.handle_updated_at();

alter table public.tuition_late_fee_overrides enable row level security;

drop policy if exists "Platform admins manage tuition_late_fee_overrides" on public.tuition_late_fee_overrides;
create policy "Platform admins manage tuition_late_fee_overrides"
  on public.tuition_late_fee_overrides for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Org members read tuition_late_fee_overrides" on public.tuition_late_fee_overrides;
create policy "Org members read tuition_late_fee_overrides"
  on public.tuition_late_fee_overrides for select to authenticated
  using (public.user_is_active_org_member(organization_id));

drop policy if exists "Org admins manage tuition_late_fee_overrides" on public.tuition_late_fee_overrides;
create policy "Org admins manage tuition_late_fee_overrides"
  on public.tuition_late_fee_overrides for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));
