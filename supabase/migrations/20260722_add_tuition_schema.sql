-- Tuition billing: rate catalog, assignments, adjustments, charges, rules
-- Run after: add_product_enrollments.sql

-- ── tuition_rate_plans ───────────────────────────────────────────────────────

create table if not exists public.tuition_rate_plans (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  program_id       uuid references public.programs(id) on delete set null,
  name             text not null,
  billing_basis    text not null default 'annual'
                     check (billing_basis in ('annual', 'monthly', 'weekly', 'per_session')),
  amount_cents     integer not null check (amount_cents >= 0),
  currency         text not null default 'USD',
  effective_start  date,
  effective_end    date,
  status           text not null default 'active'
                     check (status in ('draft', 'active', 'archived')),
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists tuition_rate_plans_organization_id_idx
  on public.tuition_rate_plans (organization_id);

create index if not exists tuition_rate_plans_program_id_idx
  on public.tuition_rate_plans (program_id)
  where program_id is not null;

create index if not exists tuition_rate_plans_org_status_idx
  on public.tuition_rate_plans (organization_id, status);

drop trigger if exists on_tuition_rate_plans_updated on public.tuition_rate_plans;
create trigger on_tuition_rate_plans_updated
  before update on public.tuition_rate_plans
  for each row execute procedure public.handle_updated_at();

-- ── tuition_payment_plans ────────────────────────────────────────────────────

create table if not exists public.tuition_payment_plans (
  id                       uuid primary key default gen_random_uuid(),
  organization_id          uuid not null references public.organizations(id) on delete cascade,
  rate_plan_id             uuid not null references public.tuition_rate_plans(id) on delete cascade,
  name                     text not null,
  installment_count        integer not null check (installment_count >= 1),
  installment_amount_cents integer not null check (installment_amount_cents >= 0),
  billing_day_of_month     integer check (billing_day_of_month between 1 and 28),
  is_default               boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists tuition_payment_plans_rate_plan_id_idx
  on public.tuition_payment_plans (rate_plan_id);

create index if not exists tuition_payment_plans_organization_id_idx
  on public.tuition_payment_plans (organization_id);

drop trigger if exists on_tuition_payment_plans_updated on public.tuition_payment_plans;
create trigger on_tuition_payment_plans_updated
  before update on public.tuition_payment_plans
  for each row execute procedure public.handle_updated_at();

-- ── tuition_fee_components ─────────────────────────────────────────────────────

create table if not exists public.tuition_fee_components (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  rate_plan_id     uuid not null references public.tuition_rate_plans(id) on delete cascade,
  code             text not null,
  label            text not null,
  amount_cents     integer not null check (amount_cents >= 0),
  currency         text not null default 'USD',
  timing           text not null default 'enrollment'
                     check (timing in ('enrollment', 'first_installment', 'annual')),
  required         boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists tuition_fee_components_rate_plan_id_idx
  on public.tuition_fee_components (rate_plan_id);

create unique index if not exists tuition_fee_components_rate_plan_code_key
  on public.tuition_fee_components (rate_plan_id, code);

drop trigger if exists on_tuition_fee_components_updated on public.tuition_fee_components;
create trigger on_tuition_fee_components_updated
  before update on public.tuition_fee_components
  for each row execute procedure public.handle_updated_at();

-- ── tuition_billing_accounts ─────────────────────────────────────────────────

create table if not exists public.tuition_billing_accounts (
  id                       uuid primary key default gen_random_uuid(),
  organization_id          uuid not null references public.organizations(id) on delete cascade,
  family_id                uuid not null references public.families(id) on delete cascade,
  autopay_enabled          boolean not null default false,
  default_payment_method_id text,
  billing_email            text,
  status                   text not null default 'active'
                             check (status in ('active', 'hold', 'collections')),
  metadata                 jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  unique (organization_id, family_id)
);

create index if not exists tuition_billing_accounts_family_id_idx
  on public.tuition_billing_accounts (family_id);

drop trigger if exists on_tuition_billing_accounts_updated on public.tuition_billing_accounts;
create trigger on_tuition_billing_accounts_updated
  before update on public.tuition_billing_accounts
  for each row execute procedure public.handle_updated_at();

-- ── tuition_enrollment_assignments ─────────────────────────────────────────────

create table if not exists public.tuition_enrollment_assignments (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  enrollment_id       uuid not null references public.enrollments(id) on delete cascade,
  family_id           uuid not null references public.families(id) on delete cascade,
  rate_plan_id        uuid not null references public.tuition_rate_plans(id) on delete restrict,
  payment_plan_id     uuid not null references public.tuition_payment_plans(id) on delete restrict,
  assignment_source   text not null default 'default'
                        check (assignment_source in ('default', 'manual', 'rule', 'import')),
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  effective_start     date,
  effective_end       date,
  status              text not null default 'active'
                        check (status in ('active', 'paused', 'ended')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (enrollment_id)
);

create index if not exists tuition_enrollment_assignments_organization_id_idx
  on public.tuition_enrollment_assignments (organization_id);

create index if not exists tuition_enrollment_assignments_family_id_idx
  on public.tuition_enrollment_assignments (family_id);

drop trigger if exists on_tuition_enrollment_assignments_updated on public.tuition_enrollment_assignments;
create trigger on_tuition_enrollment_assignments_updated
  before update on public.tuition_enrollment_assignments
  for each row execute procedure public.handle_updated_at();

-- ── tuition_adjustments ────────────────────────────────────────────────────────

create table if not exists public.tuition_adjustments (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  assignment_id       uuid not null references public.tuition_enrollment_assignments(id) on delete cascade,
  scope               text not null default 'installment'
                        check (scope in ('installment', 'annual_total', 'fee_component')),
  adjustment_type     text not null
                        check (adjustment_type in ('percent_discount', 'fixed_discount', 'custom_amount', 'waiver')),
  value_percent       numeric(5, 2) check (value_percent is null or (value_percent >= 0 and value_percent <= 100)),
  value_cents         integer check (value_cents is null or value_cents >= 0),
  reason              text not null default '',
  source              text not null default 'manual'
                        check (source in ('manual', 'rule', 'checklist_response', 'import')),
  rule_id             uuid,
  priority            integer not null default 0,
  created_by_user_id  uuid references auth.users(id) on delete set null,
  effective_start     date,
  effective_end       date,
  status              text not null default 'active'
                        check (status in ('active', 'revoked')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists tuition_adjustments_assignment_id_idx
  on public.tuition_adjustments (assignment_id);

create index if not exists tuition_adjustments_organization_id_idx
  on public.tuition_adjustments (organization_id);

drop trigger if exists on_tuition_adjustments_updated on public.tuition_adjustments;
create trigger on_tuition_adjustments_updated
  before update on public.tuition_adjustments
  for each row execute procedure public.handle_updated_at();

-- ── tuition_charges ────────────────────────────────────────────────────────────

create table if not exists public.tuition_charges (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  assignment_id       uuid not null references public.tuition_enrollment_assignments(id) on delete cascade,
  family_id           uuid not null references public.families(id) on delete cascade,
  label               text not null,
  base_amount_cents   integer not null check (base_amount_cents >= 0),
  amount_cents        integer not null check (amount_cents >= 0),
  currency            text not null default 'USD',
  due_date            date not null,
  status              text not null default 'scheduled'
                        check (status in ('scheduled', 'sent', 'paid', 'overdue', 'waived', 'void')),
  charge_type         text not null default 'tuition'
                        check (charge_type in ('tuition', 'fee', 'adjustment_credit')),
  installment_number  integer,
  sent_at             timestamptz,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists tuition_charges_assignment_id_idx
  on public.tuition_charges (assignment_id);

create index if not exists tuition_charges_family_id_idx
  on public.tuition_charges (family_id);

create index if not exists tuition_charges_org_due_date_idx
  on public.tuition_charges (organization_id, due_date);

create index if not exists tuition_charges_org_status_idx
  on public.tuition_charges (organization_id, status);

drop trigger if exists on_tuition_charges_updated on public.tuition_charges;
create trigger on_tuition_charges_updated
  before update on public.tuition_charges
  for each row execute procedure public.handle_updated_at();

-- ── tuition_adjustment_rules (Phase 3) ───────────────────────────────────────

create table if not exists public.tuition_adjustment_rules (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,
  name                text not null,
  priority            integer not null default 0,
  conditions          jsonb not null default '{}'::jsonb,
  adjustment_type     text not null
                        check (adjustment_type in ('percent_discount', 'fixed_discount', 'custom_amount', 'waiver')),
  value_percent       numeric(5, 2) check (value_percent is null or (value_percent >= 0 and value_percent <= 100)),
  value_cents         integer check (value_cents is null or value_cents >= 0),
  reason              text not null default '',
  auto_apply          boolean not null default true,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists tuition_adjustment_rules_organization_id_idx
  on public.tuition_adjustment_rules (organization_id);

alter table public.tuition_adjustments
  drop constraint if exists tuition_adjustments_rule_id_fkey;

alter table public.tuition_adjustments
  add constraint tuition_adjustments_rule_id_fkey
  foreign key (rule_id) references public.tuition_adjustment_rules(id) on delete set null;

drop trigger if exists on_tuition_adjustment_rules_updated on public.tuition_adjustment_rules;
create trigger on_tuition_adjustment_rules_updated
  before update on public.tuition_adjustment_rules
  for each row execute procedure public.handle_updated_at();

-- ── family_payment_methods (Phase 4) ─────────────────────────────────────────

create table if not exists public.family_payment_methods (
  id                       uuid primary key default gen_random_uuid(),
  organization_id          uuid not null references public.organizations(id) on delete cascade,
  family_id                uuid not null references public.families(id) on delete cascade,
  billing_account_id       uuid not null references public.tuition_billing_accounts(id) on delete cascade,
  stripe_payment_method_id text not null,
  brand                    text,
  last4                    text,
  exp_month                integer,
  exp_year                 integer,
  is_default               boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists family_payment_methods_billing_account_id_idx
  on public.family_payment_methods (billing_account_id);

create unique index if not exists family_payment_methods_stripe_pm_key
  on public.family_payment_methods (organization_id, stripe_payment_method_id);

drop trigger if exists on_family_payment_methods_updated on public.family_payment_methods;
create trigger on_family_payment_methods_updated
  before update on public.family_payment_methods
  for each row execute procedure public.handle_updated_at();

-- ── organization_settings tuition config ─────────────────────────────────────

alter table public.organization_settings
  add column if not exists tuition jsonb not null default '{}'::jsonb;
