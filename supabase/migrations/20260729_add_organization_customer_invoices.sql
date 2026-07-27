-- MudKitchen subscription invoices (platform → school billing).
-- Run after: add_product_organizations.sql, add_product_rls_helpers.sql

create table if not exists public.organization_customer_invoices (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references public.organizations(id) on delete cascade,
  billing_period_label text not null,
  amount_cents         integer not null check (amount_cents > 0),
  currency             text not null default 'usd',
  stripe_invoice_url   text not null,
  status               text not null default 'due' check (status in ('due', 'paid')),
  paid_at              timestamptz,
  paid_by_user_id      uuid references auth.users(id) on delete set null,
  paid_by_email        text,
  created_by_user_id   uuid references auth.users(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists organization_customer_invoices_org_created_idx
  on public.organization_customer_invoices (organization_id, created_at desc);

create index if not exists organization_customer_invoices_org_status_idx
  on public.organization_customer_invoices (organization_id, status);

drop trigger if exists on_organization_customer_invoices_updated on public.organization_customer_invoices;
create trigger on_organization_customer_invoices_updated
  before update on public.organization_customer_invoices
  for each row execute procedure public.handle_updated_at();

alter table public.organization_customer_invoices enable row level security;

create policy "Platform admins manage customer invoices"
  on public.organization_customer_invoices
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy "Org admins read customer invoices"
  on public.organization_customer_invoices
  for select
  to authenticated
  using (public.user_is_org_admin(organization_id));
