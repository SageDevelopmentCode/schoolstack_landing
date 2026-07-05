-- Stripe Connect: organization payment accounts and application payment ledger
-- Run after: add_product_applications.sql, add_product_admissions_rls.sql

create table if not exists public.organization_payment_accounts (
  organization_id           uuid primary key references public.organizations(id) on delete cascade,
  stripe_connect_account_id text unique,
  onboarding_status         text not null default 'not_started'
                              check (onboarding_status in ('not_started', 'pending', 'complete')),
  charges_enabled           boolean not null default false,
  payouts_enabled           boolean not null default false,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists organization_payment_accounts_stripe_id_idx
  on public.organization_payment_accounts (stripe_connect_account_id)
  where stripe_connect_account_id is not null;

drop trigger if exists on_organization_payment_accounts_updated on public.organization_payment_accounts;
create trigger on_organization_payment_accounts_updated
  before update on public.organization_payment_accounts
  for each row execute procedure public.handle_updated_at();

-- ── application_payments ──────────────────────────────────────────────────────

create table if not exists public.application_payments (
  id                        uuid primary key default gen_random_uuid(),
  organization_id           uuid not null references public.organizations(id) on delete cascade,
  application_id            uuid not null references public.applications(id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id  text unique,
  amount_cents              integer not null check (amount_cents >= 0),
  currency                  text not null default 'USD',
  status                    text not null default 'pending'
                              check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at                timestamptz not null default now(),
  paid_at                   timestamptz
);

create index if not exists application_payments_organization_id_idx
  on public.application_payments (organization_id);

create index if not exists application_payments_application_id_idx
  on public.application_payments (application_id);

create index if not exists application_payments_status_idx
  on public.application_payments (organization_id, status);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.organization_payment_accounts enable row level security;
alter table public.application_payments enable row level security;

create policy "Platform admins manage organization_payment_accounts"
  on public.organization_payment_accounts
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins can read organization_payment_accounts"
  on public.organization_payment_accounts
  for select
  to authenticated
  using (public.user_is_org_admin(organization_id));

create policy "Platform admins manage application_payments"
  on public.application_payments
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins can read application_payments"
  on public.application_payments
  for select
  to authenticated
  using (public.user_is_org_admin(organization_id));

create policy "Guardians can read own application_payments"
  on public.application_payments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_id
        and (
          (a.family_id is not null and public.user_is_guardian_for_family(a.family_id))
          or a.created_by_user_id = auth.uid()
        )
    )
  );
