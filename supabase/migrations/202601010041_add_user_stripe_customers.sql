-- Platform Stripe Customer IDs keyed by auth user (for saved payment methods at Checkout)
-- Run in Supabase SQL editor.

create table if not exists public.user_stripe_customers (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id   text not null unique,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists user_stripe_customers_stripe_customer_id_idx
  on public.user_stripe_customers (stripe_customer_id);

drop trigger if exists on_user_stripe_customers_updated on public.user_stripe_customers;
create trigger on_user_stripe_customers_updated
  before update on public.user_stripe_customers
  for each row execute procedure public.handle_updated_at();

alter table public.user_stripe_customers enable row level security;

create policy "Users can read own stripe customer"
  on public.user_stripe_customers
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Platform admins manage user_stripe_customers"
  on public.user_stripe_customers
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
