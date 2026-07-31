-- Tuition: guardian split billing + overpayment tracking
-- Run in Supabase SQL Editor after reviewing.
-- Date: 2026-07-31

-- ── tuition_billing_splits ───────────────────────────────────────────────────

create table if not exists public.tuition_billing_splits (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  family_id        uuid not null references public.families(id) on delete cascade,
  guardian_id      uuid not null references public.guardians(id) on delete cascade,
  share_bps        integer not null check (share_bps > 0 and share_bps <= 10000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (family_id, guardian_id)
);

create index if not exists tuition_billing_splits_family_id_idx
  on public.tuition_billing_splits (family_id);

create index if not exists tuition_billing_splits_organization_id_idx
  on public.tuition_billing_splits (organization_id);

drop trigger if exists on_tuition_billing_splits_updated on public.tuition_billing_splits;
create trigger on_tuition_billing_splits_updated
  before update on public.tuition_billing_splits
  for each row execute procedure public.handle_updated_at();

-- ── tuition_charges extensions ───────────────────────────────────────────────

alter table public.tuition_charges
  add column if not exists guardian_id uuid references public.guardians(id) on delete set null;

alter table public.tuition_charges
  add column if not exists paid_cents integer not null default 0 check (paid_cents >= 0);

create index if not exists tuition_charges_guardian_id_idx
  on public.tuition_charges (guardian_id)
  where guardian_id is not null;

-- ── application_payments extensions ──────────────────────────────────────────

alter table public.application_payments
  add column if not exists amount_applied_cents integer;

-- Backfill existing rows
update public.application_payments
set amount_applied_cents = amount_cents
where amount_applied_cents is null
  and payment_type = 'tuition';

drop index if exists public.application_payments_tuition_succeeded_unique_idx;

-- ── family_payment_methods extensions ────────────────────────────────────────

alter table public.family_payment_methods
  add column if not exists guardian_id uuid references public.guardians(id) on delete cascade;

create unique index if not exists family_payment_methods_billing_guardian_key
  on public.family_payment_methods (billing_account_id, guardian_id)
  where guardian_id is not null;

-- ── RLS: tuition_billing_splits ──────────────────────────────────────────────

alter table public.tuition_billing_splits enable row level security;

create policy "Platform admins manage tuition_billing_splits"
  on public.tuition_billing_splits for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org members read tuition_billing_splits"
  on public.tuition_billing_splits for select to authenticated
  using (public.user_is_active_org_member(organization_id));

create policy "Guardians read own tuition_billing_splits"
  on public.tuition_billing_splits for select to authenticated
  using (public.user_is_guardian_for_family(family_id));

create policy "Org admins manage tuition_billing_splits"
  on public.tuition_billing_splits for all to authenticated
  using (public.user_is_org_admin(organization_id))
  with check (public.user_is_org_admin(organization_id));

-- ── RLS: guardian-scoped tuition_charges ─────────────────────────────────────
-- Replace broad guardian read with scoped read (null guardian_id = legacy family charge)

drop policy if exists "Guardians read own tuition_charges" on public.tuition_charges;

create policy "Guardians read own tuition_charges"
  on public.tuition_charges for select to authenticated
  using (
    public.user_is_guardian_for_family(family_id)
    and (
      guardian_id is null
      or exists (
        select 1 from public.guardians g
        where g.id = tuition_charges.guardian_id
          and g.user_id = auth.uid()
      )
    )
  );
